package sistema_bancario;

public class Cliente {
	
	private String nome;
	private String cpf;
	private String email;
	
	// Metodos de acesso (getters e setters)
	//Nome
	public String getNome(){
		return nome;
	}
	public void setNome(String nome) {
		if (nome != null && !nome.isBlank()) {
			this.nome = nome;
		}else {
			System.out.println("Erro nome invalido!");
		}
	}
	//CPF
	public String getCpf() {
		return cpf;
	}
	
	public void setCpf(String cpf) {
		this.cpf = cpf;
	}
	//Email
	public String getEmail() {
		return email;
	}
	public void setEmail( String email) {
		this.email = email;
	}
}
