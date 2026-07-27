import pyautogui
import time
import sys

def main():
    print("========================================")
    print("🤖 ROBÔ DE SALVAR ABAS DO SOFIFA v3 🤖")
    print("========================================")
    print("O robô vai salvar da página '3.2' até a '3.30' (29 páginas no total).")
    print("\nINSTRUÇÕES FINAIS:")
    print("1. Salve a primeira aba manualmente como '3.1' na pasta desejada (para o Chrome lembrar a pasta).")
    print("2. Deixe o Google Chrome aberto NA PRIMEIRA ABA (a que você acabou de salvar como 3.1).")
    print("3. O robô vai começar em 10 segundos! Corra para o Chrome e não mexa em nada.")
    
    for i in range(10, 0, -1):
        print(f"{i} segundos...", end="\r")
        time.sleep(1)
        
    print("\n\nIniciando o trabalho! Por favor, não mexa em nada...")

    # Vamos do 2 ao 30
    for i in range(2, 31):
        print(f"[{i-1}/29] Trocando de aba e salvando como 3.{i}...")
        
        # 1. Muda para a próxima aba
        pyautogui.hotkey('ctrl', 'tab')
        time.sleep(1.0) # Espera a página focar
        
        # 2. Pressiona Ctrl + S para salvar
        pyautogui.hotkey('ctrl', 's')
        
        # 3. Aguarda a janela "Salvar como" aparecer
        time.sleep(2.0)
        
        # 4. Digita o nome do arquivo
        nome_arquivo = f"3.{i}"
        pyautogui.write(nome_arquivo)
        time.sleep(0.5)
        
        # 5. Pressiona Enter para confirmar
        pyautogui.press('enter')
        
        # 6. Aguarda o download concluir antes de ir para a próxima
        time.sleep(3.0)

    print("\n✅ Finalizado! Todas as 29 abas extras foram salvas (3.2 até 3.30).")

if __name__ == "__main__":
    main()
