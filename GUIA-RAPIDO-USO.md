# 🚀 GUIA RÁPIDO - Como Usar o Sistema

## 1️⃣ Primeiro Acesso

### Inicie o Sistema
1. **Backend**: Abra um terminal PowerShell
   ```powershell
   cd C:\Users\folli\Documents\real-estate-ai\backend
   npm run dev
   ```
   Aguarde: `Server running on http://localhost:8001`

2. **Frontend**: Abra OUTRO terminal PowerShell
   ```powershell
   cd C:\Users\folli\Documents\real-estate-ai\main-app
   npm run dev
   ```
   Aguarde: `Ready on http://localhost:3000`

3. Abra navegador em: **http://localhost:3000**

---

## 2️⃣ Como Usar Como USUÁRIO (Cliente)

### Login
1. Clique em **"Entrar"** no canto superior direito
2. Use credencial de usuário:
   - Email: `user1@goiania.test`
   - Senha: `user1123`

### Funcionalidades Disponíveis
- ✅ **Ver Imóveis**: Navegar pela lista de casas e apartamentos
- ✅ **Filtrar**: Por tipo, preço, cidade
- ✅ **Recomendações**: Ver imóveis recomendados
- ✅ **Perfil**: Ver e editar seu perfil
- ✅ **Logout**: Sair da conta

### Navegação
```
Navbar:
┌───────────────────────────────────────────────────┐
│ [🏠 EasyHome]  Imóveis  Recomendações  [user1@...] [Sair]
└───────────────────────────────────────────────────┘
```

---

## 3️⃣ Como Usar Como CORRETOR

### Login
1. Use credencial de corretor:
   - Email: `broker1@goiania.test`
   - Senha: `broker1123`

### Funcionalidades EXTRAS
- ✅ **Cadastrar Imóvel**: Botão verde no header
- ✅ **Upload de Fotos**: Até 10 imagens por imóvel
- ❌ **Sem Recomendações**: Essa aba não aparece (corretores veem "Cadastrar Imóvel" no lugar)

### Como Cadastrar um Imóvel
1. Após login, clique em **"Cadastrar Imóvel"** (botão verde)
2. Preencha o formulário:
   - **Título**: "Apartamento 3 quartos Centro"
   - **Descrição**: Mínimo 20 caracteres
   - **Tipo**: Casa ou Apartamento
   - **Preço**: Em reais (ex: 350000)
   - **Características**: Quartos, banheiros, área, vagas
   - **Localização**: Endereço, cidade (Goiânia), estado (GO), CEP
   - **Comodidades**: Digite e clique "Adicionar" (ex: Piscina, Academia)
   - **Fotos**: Clique em "Choose Files" e selecione imagens

3. Clique em **"Cadastrar Imóvel"**
4. Aguarde upload das fotos + criação do imóvel
5. Você será redirecionado para a lista de imóveis

### Navegação (Corretor)
```
Navbar:
┌───────────────────────────────────────────────────┐
│ [🏠 EasyHome]  Imóveis  [Cadastrar Imóvel] [broker1@...] [Sair]
└───────────────────────────────────────────────────┘
     Note: SEM aba "Recomendações"
```

---

## 4️⃣ Como Usar Como CONSTRUTORA

### Login
1. Use credencial de construtora:
   - Email: `companyowner1@goiania.test`
   - Senha: `company1123`

### Funcionalidades
Idênticas ao corretor:
- ✅ Cadastrar imóveis
- ✅ Upload de fotos
- ❌ Sem recomendações

### Diferença para Corretor
- Construtoras têm uma **empresa associada** no banco
- Os imóveis cadastrados aparecem com o nome da construtora

---

## 5️⃣ Testando o Upload de Imagens

### Passo a Passo Completo
1. Faça login como corretor ou construtora
2. Clique em **"Cadastrar Imóvel"**
3. Preencha TODOS os campos obrigatórios (*)
4. Na seção **"Fotos do Imóvel"**:
   - Clique no botão de arquivo
   - Selecione 1-10 imagens do seu computador
   - As imagens são enviadas ANTES do cadastro do imóvel

5. Clique em **"Cadastrar Imóvel"**
6. O que acontece nos bastidores:
   ```
   1. Frontend faz upload das imagens → POST /api/properties/upload
   2. Backend salva em backend/uploads/ e retorna URLs
   3. Frontend inclui URLs no cadastro do imóvel → POST /api/properties
   4. Imóvel criado com campo images: ["/uploads/123.jpg", "/uploads/456.jpg"]
   ```

7. Ao visualizar o imóvel, as fotos aparecem!

---

## 6️⃣ API Endpoints (Para Testes Avançados)

### Autenticação
```http
POST http://localhost:8001/api/auth/register
Content-Type: application/json

{
  "email": "teste@teste.com",
  "password": "Senha123!",
  "role": "USER",
  "firstName": "João",
  "lastName": "Silva"
}
```

```http
POST http://localhost:8001/api/auth/login
Content-Type: application/json

{
  "email": "user1@goiania.test",
  "password": "user1123"
}
```

### Imóveis
```http
GET http://localhost:8001/api/properties
  ?page=1
  &limit=10
  &type=APARTMENT
  &city=Goiânia
```

```http
POST http://localhost:8001/api/properties
Authorization: Bearer SEU_TOKEN_AQUI
Content-Type: application/json

{
  "title": "Casa Teste",
  "description": "Descrição com mais de 20 caracteres",
  "propertyType": "HOUSE",
  "price": 500000,
  "priceType": "SALE",
  "bedrooms": 3,
  "bathrooms": 2,
  "area": 150,
  "address": "Rua Teste, 123",
  "city": "Goiânia",
  "state": "GO",
  "zipCode": "74000-000"
}
```

### Upload de Imagens
```http
POST http://localhost:8001/api/properties/upload
Authorization: Bearer SEU_TOKEN_AQUI
Content-Type: multipart/form-data

(arquivo de imagem no campo "images")
```

---

## 7️⃣ Atalhos de Teclado (Desenvolvimento)

### No Terminal
- **Ctrl + C**: Para o servidor
- **Ctrl + L**: Limpa o terminal

### No Navegador
- **Ctrl + Shift + R**: Recarrega sem cache
- **F12**: Abre DevTools
- **Ctrl + Shift + I**: Também abre DevTools

---

## 8️⃣ Comandos Úteis do Prisma

### Ver banco de dados visualmente
```powershell
cd C:\Users\folli\Documents\real-estate-ai\backend
npx prisma studio
```
Abre em http://localhost:5555

### Ver SQL gerado pelas queries
No código, adicione:
```typescript
const prisma = new PrismaClient({ log: ['query'] })
```

### Resetar banco (CUIDADO! Apaga tudo)
```powershell
npx prisma migrate reset --force
```

---

## 9️⃣ Estrutura de um Imóvel no Banco

```typescript
{
  id: "clxyz123...",
  title: "Casa Moderna no Jardim Goiás",
  description: "Linda casa com 4 quartos...",
  propertyType: "HOUSE",  // ou "APARTMENT"
  status: "AVAILABLE",
  price: 1200000,
  priceType: "SALE",
  bedrooms: 4,
  bathrooms: 3,
  area: 250,
  parkingSpaces: 2,
  address: "Rua C-150, 200",
  city: "Goiânia",
  state: "GO",
  zipCode: "74805-100",
  country: "Brasil",
  images: [
    "/uploads/1234567890-foto1.jpg",
    "/uploads/1234567891-foto2.jpg"
  ],
  amenities: ["Piscina", "Academia", "Churrasqueira"],
  ownerId: "corretor-id",
  ownerType: "BROKER",
  createdAt: "2025-10-23T10:00:00Z"
}
```

---

## 🔟 Troubleshooting Comum

### "Cannot connect to database"
- Verifique se o PostgreSQL está rodando
- Confira as credenciais no `.env`

### "Property 'user' does not exist on type PrismaClient"
- Execute: `npx prisma generate`

### Upload de imagem não funciona
- Verifique se está logado (precisa de token JWT)
- Confirme que o role é BROKER ou CONSTRUCTION
- Veja se a pasta `backend/uploads` existe

### Imagens não aparecem
- As URLs devem começar com `/uploads/`
- O backend serve arquivos estáticos em `/uploads`
- Verifique no Prisma Studio se o campo `images` tem valores

---

## ✨ Próximos Passos

1. ✅ Execute o checklist em `CHECKLIST-EXECUCAO.md`
2. ✅ Teste cada funcionalidade acima
3. ✅ Cadastre alguns imóveis com fotos
4. ✅ Experimente todos os 3 tipos de usuário
5. ✅ Explore o código e personalize!

**Bom desenvolvimento! 🚀**
