import pyautogui
import time
import sys

def main():
    print("========================================")
    print("🤖 ROBÔ DE SALVAR ABAS DO SOFIFA 🤖")
    print("========================================")
    print("\nEste robô vai automatizar o processo de salvar as páginas (Ctrl+S e Enter).")
    print("Antes de começarmos, certifique-se de que:")
    print(" - Você não mudou a pasta padrão de downloads, ou que já salvou manualmente a PRIMEIRA aba na pasta correta (para o Chrome lembrar a pasta).")
    
    if len(sys.argv) > 1:
        num_tabs = int(sys.argv[1])
    else:
        try:
            num_tabs = int(input("\nQuantas abas abertas você deseja salvar? "))
        except ValueError:
            print("Por favor, digite um número válido.")
            return

    print(f"\nO robô vai salvar {num_tabs} abas seguidas.")
    print("\nINSTRUÇÕES FINAIS:")
    print("1. Volte IMEDIATAMENTE para o Google Chrome.")
    print("2. Certifique-se de estar na PRIMEIRA aba do SoFIFA que você quer salvar.")
    print("3. Não mexa o mouse nem o teclado enquanto o robô estiver trabalhando!")
    
    print("\nO robô começará a agir em:")
    for i in range(10, 0, -1):
        print(f"{i} segundos...", end="\r")
        time.sleep(1)
        
    print("\n\nIniciando o trabalho! Por favor, não mexa em nada...")

    for i in range(num_tabs):
        print(f"[{i+1}/{num_tabs}] Salvando aba atual...")
        
        # Pressiona Ctrl + S para salvar
        pyautogui.hotkey('ctrl', 's')
        
        # Aguarda a janela "Salvar como" aparecer (1.5 segundos costuma ser suficiente)
        time.sleep(1.5)
        
        # Pressiona Enter para confirmar (o Chrome vai nomear automaticamente e fechar a janela)
        pyautogui.press('enter')
        
        # Aguarda 3 segundos para dar tempo do Chrome processar o download da página
        time.sleep(3.0)
        
        # Vai para a próxima aba com Ctrl + Tab
        pyautogui.hotkey('ctrl', 'tab')
        
        # Aguarda a nova aba ficar ativa e focar corretamente
        time.sleep(0.5)

    print("\n✅ Finalizado! Todas as abas foram salvas.")

if __name__ == "__main__":
    main()
