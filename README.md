# PPO-Cursos-CMS
<h1>Padronizações:</h1>
O JSON de resposta deverá ser no formato:
<pre>```
{
    message: "mensagem",
    error: 1
}
```</pre>
Em error, cada número corresponde a:
<ul>
    <li>-1 = Erro desconhecido</li>
    <li>0 = Sem usuário para a chave fornecida</li>
    <li>1 = Acesso negado</li>
    <li>2 = Credenciais incorretas</li>
    <li>3 = Conflito</li>
    <li>4 = Erro no upload</li>
    <li>5 = Não encontrado</li>
</ul>