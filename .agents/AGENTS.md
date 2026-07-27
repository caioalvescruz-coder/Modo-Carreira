# Regras do Projeto (Modo Carreira EA FC)

- **Testes Locais Primeiro**: Sempre que o usuário solicitar uma melhoria ou correção, implemente as alterações e permita o teste local (servidor de desenvolvimento `npm run dev` ou build local) antes de salvar na nuvem ou publicar.

- **"Salve na Nuvem"**: Quando o usuário solicitar esta ação (após testar localmente), execute automaticamente os comandos do Git para salvar e sincronizar o código no GitHub:
  ```cmd
  git add .
  git commit -m "mensagemsugerida"
  git push
  ```

- **"Publique o site"**: Quando o usuário solicitar esta ação (após testar e aprovar), execute os comandos de build e publicação no Firebase Hosting:
  ```cmd
  node scripts/build.mjs
  cmd /c "npx firebase deploy --only hosting"
  ```
