import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const FIREBASE_CONFIG = {"apiKey":"AIzaSyBcyRSxHhsMMUU41p2YIVNRgfhxJolu7gg","authDomain":"carreira-ea-fc-f0aa6.firebaseapp.com","projectId":"carreira-ea-fc-f0aa6","storageBucket":"carreira-ea-fc-f0aa6.firebasestorage.app","messagingSenderId":"67238945054","appId":"1:67238945054:web:ebd9fe973a2068ef1da90f","measurementId":"G-Z03PW0MWHE"};

let app = null;
let currentUser = null;
let pendingState = null;
let saveTimer = null;
let saveInFlight = null;
let accountOperation = false;
let loadingUserId = null;

let firebaseApp, auth, db;
const configured = !!FIREBASE_CONFIG.apiKey;

if (configured) {
  firebaseApp = initializeApp(FIREBASE_CONFIG);
  auth = getAuth(firebaseApp);
  db = getFirestore(firebaseApp);
}

const byId = id => document.getElementById(id);

function setAuthStatus(message = '') {
  const status = byId('auth-message');
  if (status) status.textContent = message;
}

function setSyncStatus(message, state = 'idle') {
  const status = byId('sync-status');
  if (!status) return;
  const text = byId('sync-status-text');
  if (text) text.textContent = message;
  status.dataset.status = state === 'synced' ? 'saved' : state;
}

function showGate(message = '') {
  currentUser = null;
  const gate = byId('auth-screen');
  if (gate) gate.classList.remove('is-hidden');
  const shell = byId('app-shell');
  if (shell) {
    shell.classList.remove('is-ready');
    shell.setAttribute('aria-hidden', 'true');
  }
  const button = byId('google-login');
  if (button) button.disabled = !configured || !byId('age-confirm')?.checked;
  setAuthStatus(message);
}

function showSavesScreen(user) {
  currentUser = user;
  const gate = byId('auth-screen');
  if (gate) gate.classList.add('is-hidden');
  
  const savesScreen = byId('dashboard-saves-screen');
  if (savesScreen) {
    savesScreen.classList.remove('is-hidden');
  }

  // Preenche o email na tela de saves e na tela principal
  const dashAccountEmail = byId('dash-account-email');
  if (dashAccountEmail) dashAccountEmail.textContent = user.email || 'Conta Google';
  
  const accountEmail = byId('account-email');
  if (accountEmail) accountEmail.textContent = user.email || 'Conta Google';

  // Chama a renderização dos elencos (definida no app-render.js)
  if (typeof renderizarTelaDeElencos === 'function') {
    renderizarTelaDeElencos();
  }
}

window.enterAppShell = function() {
  const savesScreen = byId('dashboard-saves-screen');
  if (savesScreen) {
    savesScreen.classList.add('is-hidden');
  }
  
  const shell = byId('app-shell');
  if (shell) {
    shell.classList.add('is-ready');
    shell.setAttribute('aria-hidden', 'false');
  }
}

async function loadCareer(user) {
  if (loadingUserId === user.uid) return;
  loadingUserId = user.uid;
  setAuthStatus('Carregando sua carreira…');
  setSyncStatus('Carregando da nuvem', 'saving');

  try {
    const docRef = doc(db, 'career_states', user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const selectedState = app.attachUser(user.uid, data.state || null);
      showSavesScreen(user);
      setAuthStatus('');
      setSyncStatus('Sincronizado', 'synced');
    } else {
      const selectedState = app.attachUser(user.uid, null);
      showSavesScreen(user);
      setAuthStatus('');
      pendingState = selectedState;
      await flushSave();
    }
  } catch (error) {
    console.error('Falha ao carregar a carreira.', error);
    const localState = app.attachUser(user.uid, null);
    showSavesScreen(user);
    setSyncStatus('Somente neste dispositivo', 'error');
    setAuthStatus('');
    pendingState = localState;
  }
  
  loadingUserId = null;
}

async function applySession(user) {
  if (!user) {
    if (currentUser && !accountOperation) app?.detachUser({ clearCache: true });
    app?.clearSignedOutCaches();
    showGate();
    return;
  }

  if (currentUser?.uid === user.uid) return;
  await loadCareer(user);
}

async function signIn() {
  if (!configured) {
    setAuthStatus('O acesso Firebase ainda precisa ser configurado pelo administrador.');
    return;
  }
  if (!byId('age-confirm')?.checked) {
    setAuthStatus('Confirme a idade mínima para continuar.');
    return;
  }

  const button = byId('google-login');
  if (button) button.disabled = true;
  setAuthStatus('Abrindo o acesso seguro do Google…');

  try {
    await setPersistence(auth, browserLocalPersistence);
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error(error);
    setAuthStatus('Não foi possível iniciar o login. Tente novamente.');
    if (button) button.disabled = false;
  }
}

function queueSave(state) {
  if (!currentUser || !configured) return;
  pendingState = JSON.parse(JSON.stringify(state));
  setSyncStatus('Salvando alterações', 'saving');
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => void flushSave(), 900);
}

async function flushSave() {
  clearTimeout(saveTimer);
  saveTimer = null;
  if (saveInFlight) await saveInFlight;
  if (!pendingState || !currentUser) return;

  const state = pendingState;
  pendingState = null;
  
  const docRef = doc(db, 'career_states', currentUser.uid);
  const dataToSave = {
    state: state,
    updated_at: new Date().toISOString()
  };

  saveInFlight = setDoc(docRef, dataToSave, { merge: true });
  
  try {
    await saveInFlight;
    saveInFlight = null;
    setSyncStatus('Sincronizado', 'synced');
    if (pendingState) void flushSave();
  } catch (error) {
    console.error('Falha ao sincronizar a carreira.', error);
    pendingState = state;
    setSyncStatus('Falha na sincronização', 'error');
    saveInFlight = null;
  }
}

async function signOut() {
  if (!configured || accountOperation) return;
  accountOperation = true;
  setSyncStatus('Finalizando sessão', 'saving');
  await flushSave();
  app?.detachUser({ clearCache: true });
  
  try {
    await firebaseSignOut(auth);
    accountOperation = false;
    currentUser = null;
    showGate('Você saiu com segurança.');
  } catch (error) {
    console.error(error);
    accountOperation = false;
    showGate('Ocorreu uma falha ao avisar o servidor.');
  }
}

async function deleteAccount() {
  if (!configured || !currentUser || accountOperation) return;
  if (!confirm('Esta ação excluirá sua conta, carreiras e históricos da base ativa. Deseja continuar?')) return;
  const confirmation = prompt('Para confirmar, digite EXCLUIR:');
  if (confirmation !== 'EXCLUIR') return;

  accountOperation = true;
  setSyncStatus('Excluindo conta e dados', 'saving');
  
  try {
    await currentUser.delete();
    try {
      const docRef = doc(db, 'career_states', currentUser.uid);
      await deleteDoc(docRef);
    } catch (dataErr) {
      console.warn('Dados podem ter ficado órfãos:', dataErr);
    }
    
    app?.detachUser({ clearCache: true });
    currentUser = null;
    accountOperation = false;
    showGate('Sua conta e os dados da aplicação foram excluídos.');
  } catch (error) {
    accountOperation = false;
    console.error(error);
    setSyncStatus('Não foi possível excluir', 'error');
    alert('A exclusão não foi concluída. O Firebase exige um login recente para deletar a conta. Tente sair, entrar novamente e depois excluir.');
  }
}

function toggleAccount() {
  byId('auth-user-panel')?.classList.toggle('is-open');
}

async function initialize(appApi) {
  app = appApi;
  byId('google-login')?.addEventListener('click', signIn);
  byId('age-confirm')?.addEventListener('change', event => {
    const button = byId('google-login');
    if (button) button.disabled = !configured || !event.target.checked;
    if (event.target.checked) setAuthStatus('');
  });

  if (!configured) {
    showGate('Integração com Firebase não configurada.');
    return;
  }

  onAuthStateChanged(auth, (user) => {
    applySession(user);
  });
}

window.ManagerAuth = {
  initialize,
  signIn,
  signOut,
  deleteAccount,
  toggleAccount,
  queueSave,
  flushSave
};
