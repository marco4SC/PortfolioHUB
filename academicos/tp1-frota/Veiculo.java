package tp1.frota;

/**
 * Abstração e herança: superclasse abstrata para os tipos de veículos.
 * Encapsulamento: o estado é privado e validado pelos construtores/setters.
 */
public abstract class Veiculo {
    private final String placa;
    private String marca;
    private String modelo;
    private int ano;
    private Cliente locatario;

    protected Veiculo(String placa, String marca, String modelo, int ano) {
        if (placa == null || placa.isBlank()) {
            throw new IllegalArgumentException("Placa é obrigatória.");
        }
        if (marca == null || marca.isBlank() || modelo == null || modelo.isBlank()) {
            throw new IllegalArgumentException("Marca e modelo são obrigatórios.");
        }
        if (ano < 1950 || ano > 2100) {
            throw new IllegalArgumentException("Ano do veículo inválido.");
        }
        this.placa = placa.trim().toUpperCase();
        this.marca = marca.trim();
        this.modelo = modelo.trim();
        this.ano = ano;
    }

    public String getPlaca() {
        return placa;
    }

    public String getMarca() {
        return marca;
    }

    public void setMarca(String marca) {
        if (marca == null || marca.isBlank()) {
            throw new IllegalArgumentException("Marca é obrigatória.");
        }
        this.marca = marca.trim();
    }

    public String getModelo() {
        return modelo;
    }

    public void setModelo(String modelo) {
        if (modelo == null || modelo.isBlank()) {
            throw new IllegalArgumentException("Modelo é obrigatório.");
        }
        this.modelo = modelo.trim();
    }

    public int getAno() {
        return ano;
    }

    public void setAno(int ano) {
        if (ano < 1950 || ano > 2100) {
            throw new IllegalArgumentException("Ano do veículo inválido.");
        }
        this.ano = ano;
    }

    /**
     * Associação 1:1: um veículo pode ter no máximo um locatário ativo.
     */
    public Cliente getLocatario() {
        return locatario;
    }

    public void setLocatario(Cliente locatario) {
        this.locatario = locatario;
    }

    public boolean estaDisponivel() {
        return locatario == null;
    }

    /**
     * Método abstrato implementado polimorficamente pelas subclasses.
     */
    public abstract double calcularDiaria();

    /**
     * Segundo método abstrato exigido pelo TP1.
     */
    public abstract String gerarDescricao();

    @Override
    public String toString() {
        String status = estaDisponivel() ? "Disponível" : "Locado para " + locatario.getNome();
        return gerarDescricao() + " | placa: " + placa + " | " + status;
    }
}
