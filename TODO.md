# TODO - Refactor API/Fetch para Services

## Etapa 1 — Base de comunicação
- [ ] Criar `src/lib/apiClient.ts` (wrapper do fetch com baseURL + parse de erro)
- [ ] Criar `src/services/authService.ts`
- [ ] Criar `src/services/productService.ts`
- [ ] Criar `src/services/movementsService.ts`
- [ ] Criar `src/services/supplierService.ts`
- [ ] Criar `src/services/categoryService.ts`
- [ ] Criar `src/services/userService.ts`

## Etapa 2 — Auth e componentes de alto impacto
- [x] Refatorar `src/components/AuthProvider.tsx` para usar `authService`

- [x] Refatorar `src/components/Login.tsx` para usar `authService`

- [x] Refatorar `src/components/Layout.tsx` (TopBar): buscar produtos/notifications e upload avatar via services


## Etapa 3 — Produtos e detalhes
- [ ] Refatorar `src/components/Dashboard.tsx` para usar services
- [ ] Refatorar `src/components/InventoryList.tsx` para usar services
- [ ] Refatorar `src/components/ProductCatalog.tsx` para usar services
- [ ] Refatorar `src/components/ProductDetail.tsx` para usar services
- [ ] Refatorar `src/components/ProductModal.tsx` para usar services (inclui upload de imagem + movements)

## Etapa 4 — Movimentos e destinos
- [ ] Refatorar `src/components/MovementForm.tsx` para usar services

## Etapa 5 — Fornecedores e Categorias
- [ ] Refatorar `src/components/Suppliers.tsx` para usar services
- [ ] Refatorar `src/components/SupplierModal.tsx` para usar services
- [ ] Refatorar `src/components/CategoryManagementModal.tsx` para usar services

## Etapa 6 — Relatórios e lixeira
- [ ] Refatorar `src/components/Reports.tsx` para usar services
- [ ] Refatorar `src/components/DeletedItems.tsx` para usar services

## Etapa 7 — Ajustes finais
- [ ] Refatorar `src/components/ABCAnalysis.tsx` para usar services
- [ ] Revisar `src/components/FirebaseProvider.tsx` (remover ou deixar como legado se não usado)
- [ ] Rodar `npm run build` (e `npm run lint` se existir)


