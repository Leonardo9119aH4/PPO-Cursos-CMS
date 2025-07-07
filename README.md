# PPO-Cursos-CMS
<h1>Padronizações:</h1>
Caso a resposta seja do status 400, será necessário seguir o formato abaixo com o código de erro adequado
<pre>```
{
    message: "mensagem",
    error: 1
}
```</pre>
Em "error", cada número corresponde a:
<ul>
    <li>1 = Cookie inválido/faltante</li>
    <li>2 = Credenciais incorretas/incompletas</li>
    <li>3 = Senha insegura</li>
    <li>4 = Erro no upload</li>
</ul>
