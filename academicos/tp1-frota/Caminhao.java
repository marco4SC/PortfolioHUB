package tp1.frota;

/**
 * Herança: Caminhao especializa a superclasse Veiculo.
 */
public class Caminhao extends Veiculo {
    private double capacidadeToneladas;

    public Caminhao(String placa, String marca, String modelo, int ano, double capacidadeToneladas) {
        // Construtor com super: reaproveita as validações da superclasse.
        super(placa, marca, modelo, ano);
        if (capacidadeToneladas <= 0 || capacidadeToneladas > 100) {
            throw new IllegalArgumentException("Capacidade de carga inválida.");
        }
        this.capacidadeToneladas = capacidadeToneladas;
    }

    public double getCapacidadeToneladas() {
        return capacidadeToneladas;
    }

    public void setCapacidadeToneladas(double capacidadeToneladas) {
        if (capacidadeToneladas <= 0 || capacidadeToneladas > 100) {
            throw new IllegalArgumentException("Capacidade de carga inválida.");
        }
        this.capacidadeToneladas = capacidadeToneladas;
    }

    @Override
    public double calcularDiaria() {
        return 250.0 + (capacidadeToneladas * 15.0);
    }

    @Override
    public String gerarDescricao() {
        return "Caminhão " + getMarca() + " " + getModelo()
                + " (" + String.format("%.1f", capacidadeToneladas) + " t), diária R$ "
                + String.format("%.2f", calcularDiaria());
    }
}
