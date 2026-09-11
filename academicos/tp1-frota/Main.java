package tp1.frota;

import java.util.Scanner;

/**
 * Interface via console: menu interativo com Scanner.
 * O domínio escolhido é a Opção A: gestão de frota e locação de veículos.
 */
public class Main {
    private static final Scanner SCANNER = new Scanner(System.in);
    private static final GestaoFrota GESTAO = new GestaoFrota();

    public static void main(String[] args) {
        carregarDadosExemplo();
        int opcao;
        do {
            exibirMenu();
            opcao = lerInteiro("Escolha uma opção: ");
            try {
                executarOpcao(opcao);
            } catch (IllegalArgumentException exception) {
                System.out.println("Operação não realizada: " + exception.getMessage());
            }
        } while (opcao != 0);
        SCANNER.close();
    }

    private static void exibirMenu() {
        System.out.println("\n=== SISTEMA DE GESTÃO DE FROTA ===");
        System.out.println("1 - Cadastrar carro de passeio");
        System.out.println("2 - Cadastrar caminhão");
        System.out.println("3 - Buscar veículo por placa");
        System.out.println("4 - Listar veículos");
        System.out.println("5 - Registrar locação");
        System.out.println("6 - Listar locações");
        System.out.println("7 - Exibir relatório");
        System.out.println("0 - Encerrar");
    }

    private static void executarOpcao(int opcao) {
        switch (opcao) {
            case 1 -> cadastrarCarro();
            case 2 -> cadastrarCaminhao();
            case 3 -> buscarVeiculo();
            case 4 -> listarVeiculos();
            case 5 -> registrarLocacao();
            case 6 -> listarLocacoes();
            case 7 -> GESTAO.imprimirRelatorio();
            case 0 -> System.out.println("Sistema encerrado.");
            default -> System.out.println("Opção inválida.");
        }
    }

    private static void cadastrarCarro() {
        String placa = lerTexto("Placa: ");
        String marca = lerTexto("Marca: ");
        String modelo = lerTexto("Modelo: ");
        int ano = lerInteiro("Ano: ");
        int portas = lerInteiro("Quantidade de portas: ");
        boolean cadastrado = GESTAO.cadastrarVeiculo(new CarroPasseio(placa, marca, modelo, ano, portas));
        System.out.println(cadastrado ? "Carro cadastrado." : "Placa já cadastrada.");
    }

    private static void cadastrarCaminhao() {
        String placa = lerTexto("Placa: ");
        String marca = lerTexto("Marca: ");
        String modelo = lerTexto("Modelo: ");
        int ano = lerInteiro("Ano: ");
        double capacidade = lerDouble("Capacidade em toneladas: ");
        boolean cadastrado = GESTAO.cadastrarVeiculo(new Caminhao(placa, marca, modelo, ano, capacidade));
        System.out.println(cadastrado ? "Caminhão cadastrado." : "Placa já cadastrada.");
    }

    private static void buscarVeiculo() {
        Veiculo veiculo = GESTAO.buscarPorPlaca(lerTexto("Informe a placa: "));
        System.out.println(veiculo == null ? "Veículo não encontrado." : veiculo);
    }

    private static void listarVeiculos() {
        if (GESTAO.listarVeiculos().isEmpty()) {
            System.out.println("Nenhum veículo cadastrado.");
            return;
        }
        for (Veiculo veiculo : GESTAO.listarVeiculos()) {
            System.out.println(veiculo);
        }
    }

    private static void registrarLocacao() {
        String placa = lerTexto("Placa do veículo: ");
        Cliente cliente = new Cliente(
                lerTexto("Documento do cliente: "),
                lerTexto("Nome do cliente: "),
                lerTexto("Telefone do cliente: "));
        int dias = lerInteiro("Quantidade de dias: ");
        System.out.println(GESTAO.registrarLocacao(placa, cliente, dias)
                ? "Locação registrada."
                : "Não foi possível registrar a locação.");
    }

    private static void listarLocacoes() {
        if (GESTAO.listarLocacoes().isEmpty()) {
            System.out.println("Nenhuma locação registrada.");
            return;
        }
        for (Locacao locacao : GESTAO.listarLocacoes()) {
            System.out.println(locacao);
        }
    }

    private static void carregarDadosExemplo() {
        GESTAO.cadastrarVeiculo(new CarroPasseio("ABC1D23", "Toyota", "Corolla", 2022, 4));
        GESTAO.cadastrarVeiculo(new Caminhao("XYZ9K87", "Volvo", "VM", 2020, 12.5));
    }

    private static String lerTexto(String mensagem) {
        System.out.print(mensagem);
        return SCANNER.nextLine().trim();
    }

    private static int lerInteiro(String mensagem) {
        while (true) {
            try {
                return Integer.parseInt(lerTexto(mensagem));
            } catch (NumberFormatException exception) {
                System.out.println("Digite um número inteiro válido.");
            }
        }
    }

    private static double lerDouble(String mensagem) {
        while (true) {
            try {
                return Double.parseDouble(lerTexto(mensagem).replace(',', '.'));
            } catch (NumberFormatException exception) {
                System.out.println("Digite um número decimal válido.");
            }
        }
    }
}
