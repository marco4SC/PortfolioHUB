package tp1.frota;

/**
 * Classe de apoio da associação 1:1 entre um veículo e seu locatário.
 * Encapsulamento: os atributos são privados e acessados por getters.
 */
public class Cliente {
    private final String documento;
    private String nome;
    private String telefone;

    public Cliente(String documento, String nome, String telefone) {
        if (documento == null || documento.isBlank()) {
            throw new IllegalArgumentException("Documento do cliente é obrigatório.");
        }
        if (nome == null || nome.isBlank()) {
            throw new IllegalArgumentException("Nome do cliente é obrigatório.");
        }
        this.documento = documento.trim();
        this.nome = nome.trim();
        this.telefone = telefone == null ? "" : telefone.trim();
    }

    public String getDocumento() {
        return documento;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        if (nome == null || nome.isBlank()) {
            throw new IllegalArgumentException("Nome do cliente é obrigatório.");
        }
        this.nome = nome.trim();
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone == null ? "" : telefone.trim();
    }

    @Override
    public String toString() {
        return nome + " (documento: " + documento + ", telefone: " + telefone + ")";
    }
}
