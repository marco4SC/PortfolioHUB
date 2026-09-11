package tp1.frota;

import java.util.ArrayList;
import java.util.List;

/**
 * Classe gerenciadora.
 * Polimorfismo e coleções: a lista guarda Veiculo, mas percorre CarroPasseio
 * e Caminhao por meio das implementações concretas dos métodos abstratos.
 */
public class GestaoFrota {
    private final ArrayList<Veiculo> veiculos = new ArrayList<>();
    private final ArrayList<Locacao> locacoes = new ArrayList<>();

    public boolean cadastrarVeiculo(Veiculo veiculo) {
        if (veiculo == null || buscarPorPlaca(veiculo.getPlaca()) != null) {
            return false;
        }
        veiculos.add(veiculo);
        return true;
    }

    public Veiculo buscarPorPlaca(String placa) {
        if (placa == null || placa.isBlank()) {
            return null;
        }
        for (Veiculo veiculo : veiculos) {
            if (veiculo != null && veiculo.getPlaca().equalsIgnoreCase(placa.trim())) {
                return veiculo;
            }
        }
        return null;
    }

    public boolean registrarLocacao(String placa, Cliente cliente, int dias) {
        Veiculo veiculo = buscarPorPlaca(placa);
        if (veiculo == null || cliente == null || !veiculo.estaDisponivel()) {
            return false;
        }
        Locacao locacao = new Locacao(veiculo, cliente, dias);
        veiculo.setLocatario(cliente);
        locacoes.add(locacao);
        return true;
    }

    public List<Veiculo> listarVeiculos() {
        return List.copyOf(veiculos);
    }

    public List<Locacao> listarLocacoes() {
        return List.copyOf(locacoes);
    }

    public int contarDisponiveis() {
        int total = 0;
        for (Veiculo veiculo : veiculos) {
            if (veiculo != null && veiculo.estaDisponivel()) {
                total++;
            }
        }
        return total;
    }

    public double calcularReceitaTotal() {
        double total = 0;
        for (Locacao locacao : locacoes) {
            if (locacao != null) {
                total += locacao.calcularTotal();
            }
        }
        return total;
    }

    public void imprimirRelatorio() {
        System.out.println("\n=== RELATÓRIO DA FROTA ===");
        System.out.println("Total de veículos: " + veiculos.size());
        System.out.println("Veículos disponíveis: " + contarDisponiveis());
        System.out.println("Veículos locados: " + locacoes.size());
        System.out.printf("Receita projetada: R$ %.2f%n", calcularReceitaTotal());
        System.out.println("\nDetalhamento polimórfico:");
        for (Veiculo veiculo : veiculos) {
            if (veiculo != null) {
                System.out.println("- " + veiculo.gerarDescricao());
            }
        }
    }
}
