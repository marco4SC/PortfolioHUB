package tp1.frota;

/**
 * Herança: CarroPasseio especializa a superclasse Veiculo.
 */
public class CarroPasseio extends Veiculo {
    private int quantidadePortas;

    public CarroPasseio(String placa, String marca, String modelo, int ano, int quantidadePortas) {
        // Construtor com super: inicializa a parte comum herdada.
        super(placa, marca, modelo, ano);
        if (quantidadePortas < 2 || quantidadePortas > 5) {
            throw new IllegalArgumentException("Quantidade de portas inválida.");
        }
        this.quantidadePortas = quantidadePortas;
    }

    public int getQuantidadePortas() {
        return quantidadePortas;
    }

    public void setQuantidadePortas(int quantidadePortas) {
        if (quantidadePortas < 2 || quantidadePortas > 5) {
            throw new IllegalArgumentException("Quantidade de portas inválida.");
        }
        this.quantidadePortas = quantidadePortas;
    }

    @Override
    public double calcularDiaria() {
        return 120.0 + (quantidadePortas == 2 ? 10.0 : 0.0);
    }

    @Override
    public String gerarDescricao() {
        return "Carro de passeio " + getMarca() + " " + getModelo()
                + " (" + quantidadePortas + " portas), diária R$ "
                + String.format("%.2f", calcularDiaria());
    }
}
