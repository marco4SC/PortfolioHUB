# TP1 - Sistema de Gestão de Frota e Locação de Veículos

Implementação individual da Opção A do TP1, executável via console.

## Requisitos demonstrados

- **Encapsulamento:** atributos privados, construtores parametrizados, getters e setters com validação.
- **Associação 1:1:** um `Veiculo` possui no máximo um `Cliente` como locatário ativo; `Locacao` relaciona um veículo a um cliente.
- **Abstração:** `Veiculo` é uma classe `abstract`.
- **Herança:** `CarroPasseio` e `Caminhao` herdam de `Veiculo`.
- **Sobrescrita:** as subclasses implementam `calcularDiaria()` e `gerarDescricao()` com `@Override`.
- **Polimorfismo:** `GestaoFrota` manipula `ArrayList<Veiculo>` e percorre os objetos pelas referências da superclasse.
- **Busca defensiva:** busca por placa trata placa nula ou vazia e referências nulas.
- **Console:** `Main` usa `Scanner` para cadastro, busca, listagem, locação, relatório e encerramento.

## Compilar e executar

Na pasta `academicos/tp1-frota`:

```powershell
javac -d . *.java
java tp1.frota.Main
```

O comando cria os `.class` dentro de `tp1/frota`. Esses arquivos compilados não devem ser enviados no `.zip`; envie apenas os `.java` e este README, se desejado.
