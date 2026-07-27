# Regras do Projeto (Modo Carreira EA FC)

- **"Salve na Nuvem"**: Quando o usuário solicitar esta ação, execute automaticamente os comandos do Git para salvar e sincronizar o código no GitHub:
  ```cmd
  git add .
  git commit -m "mensagemsugerida"
  git push
  ```

- **"Publique o site"**: Quando o usuário solicitar esta ação, execute os comandos de build e publicação no Firebase Hosting:
  ```cmd
  node scripts/build.mjs
  cmd /c "npx firebase deploy --only hosting"
  ```
