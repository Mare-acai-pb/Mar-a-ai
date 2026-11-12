# Maré Açaí — cardápio e fidelidade

Este projeto contém o site responsivo do cardápio, integração com WhatsApp e estrutura Supabase para pedidos e cartão fidelidade persistente.

## O que já está preparado
- Tamanhos P 500 ml (R$ 12), M 750 ml (R$ 15), G 1,1 kg (R$ 18).
- Até 7 adicionais grátis: banana, leite em pó, leite condensado, granola, paçoca, morango e confete.
- Nutella + R$ 1,50.
- Delivery em Baía da Traição e aldeias próximas, com taxa confirmada pela loja; retirada.
- Pix (chave telefone 83994037816), dinheiro e cartão na entrega.
- Pedido enviado ao WhatsApp 5583994037816.
- Clube Maré: 5 pedidos concluídos = R$ 5 de desconto; 10 = açaí P grátis.
- O banco registra o carimbo apenas quando o administrador muda o pedido para `completed`, sem duplicar em atualizações repetidas.

## Para publicar e ativar o cartão automático

### 1. Criar o projeto Supabase
1. Crie uma conta em https://supabase.com e um projeto.
2. No painel, abra **SQL Editor** e execute todo o conteúdo de `supabase.sql`.
3. Em **Project Settings → API**, copie a Project URL e a chave `anon`/publishable.
4. Edite `config.js` e substitua `https://SEU-PROJETO.supabase.co` e `SUA_CHAVE_ANON_PUBLICA` pelos seus valores. Nunca use a `service_role` key no site.
5. Em **Authentication → Providers**, habilite Phone/SMS e configure um provedor de SMS aceito pelo Supabase. A autenticação por telefone é necessária para cada cliente acessar seu cartão com segurança.
6. Crie sua conta de administradora pelo próprio site (entrar/consultar cartão) usando o telefone da loja. Depois execute no SQL Editor:
   `update public.profiles set is_admin = true where phone = '+5583994037816';`

### 2. Publicar na Vercel
1. Crie conta em https://vercel.com.
2. Importe este projeto como um novo projeto (ou envie os arquivos pelo método de deploy disponível na sua conta).
3. Publique. O endereço `*.vercel.app` será o link público do cardápio.
4. Faça um teste real: entre com SMS, envie um pedido, confirme no WhatsApp e marque o pedido como concluído na área da loja. Confira se o cartão ganhou exatamente um carimbo.

## Como funciona a fidelidade
- Cliente autentica seu telefone por código SMS para consultar o cartão e registrar pedidos no banco.
- Pedido não conta quando é apenas enviado; conta somente quando a loja marca o status como concluído.
- Ao completar 5 pedidos concluídos no ciclo, o banco gera uma recompensa de R$ 5 de desconto.
- Ao completar 10 pedidos concluídos, gera uma recompensa de açaí P grátis e inicia o próximo ciclo de carimbos.
- A área administrativa só aparece para o perfil marcado como `is_admin`.

## Observações importantes
- O link público ainda não existe até que o projeto seja conectado ao Supabase e publicado na Vercel.
- A autenticação por SMS pode ter custo do provedor de mensagens, mesmo que a hospedagem tenha plano gratuito.
- A chave Pix é exibida para cópia; o pagamento continua sendo conferido manualmente pela loja.
- A taxa de entrega não é calculada automaticamente por mapa; a loja confirma o valor conforme o endereço.
- Antes de divulgar, confirme no app do banco o nome do titular associado à chave Pix.
