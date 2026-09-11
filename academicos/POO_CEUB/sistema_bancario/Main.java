package sistema_bancario;

public class Main {

	public static void main(String[] args) {
		
		//Instanciando o primeiro objeto do sistema
		Cliente cliente1 = new Cliente();
		Cliente cliente2 = new Cliente();
		
		//Atribuindo valores
		cliente1.setNome("Armitage");
		cliente1.setCpf("000.000.000-00");
		cliente1.setEmail("armitage.mail@gmail.com");
		
		
		cliente2.setNome("Case");
		cliente2.setCpf("123.456.789-00");
		cliente2.setEmail("case@gmail.com");
		
		//exibindo os dados no console
		System.out.println("SISTEMA BANCÁRIO");
		System.out.println("Cliente cadastrado com sucesso!");
		System.out.println("Cliente 1");
		System.out.println("Nome:" + cliente1.getNome());
		System.out.println("CPF:" + cliente1.getCpf());
		System.out.println("email:" + cliente1.getEmail());
		
		
		System.out.println("Cliente 2");
		System.out.println("Nome:" + cliente2.getNome());
		System.out.println("CPF:" + cliente2.getCpf());
		System.out.println("email:" + cliente2.getEmail());

	}

}
