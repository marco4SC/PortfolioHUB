package tp1.frota;

/**
 * Associação 1:1: representa a locação de um veículo para um cliente.
 */
public class Locacao {
    private final Veiculo veiculo;
    private final Cliente cliente;
    private final int dias;

    public Locacao(Veiculo veiculo, Cliente cliente, int dias) {
        if (veiculo == null || cliente == null) {
            throw new IllegalArgumentException("Veículo e cliente são obrigatórios.");
        }
        if (dias <= 0) {
            throw new IllegalArgumentException("A locação deve ter pelo menos um dia.");
        }
        this.veiculo = veiculo;
        this.cliente = cliente;
        this.dias = dias;
    }

    public Veiculo getVeiculo() {
        return veiculo;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public int getDias() {
        return dias;
    }

    public double calcularTotal() {
        return veiculo.calcularDiaria() * dias;
    }

    @Override
    public String toString() {
        return "Locação: " + veiculo.getPlaca() + " | cliente: " + cliente.getNome()
                + " | dias: " + dias + " | total: R$ " + String.format("%.2f", calcularTotal());
    }
}
