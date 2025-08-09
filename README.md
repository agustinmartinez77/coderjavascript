
## Funcionalidades
- Selección paso a paso: **Bebidas → Saladas → Dulces → Resumen**.
- **Buscador en vivo** por categoría (normaliza tildes, mayúsculas/minúsculas).
- **Modo nocturno** con preferencia persistente en `localStorage`.
- **Checkout** mínimo (nombre + email) con **precarga** desde `localStorage`.
- **Persistencia** del pedido en `localStorage` (`pedidoCafeteria`).
- **Imágenes** en todas las categorías (desde APIs; si faltan, se generan placeholders).
- **Fallback** robusto:
  1) APIs remotas → 2) `data/menu.json` → 3) menú embebido con imágenes.

## APIs utilizadas
- Bebidas: `https://api.sampleapis.com/coffee/{hot|iced}`
- Saladas: `https://dummyjson.com/recipes?limit=150`
- Dulces: `https://www.themealdb.com/api/json/v1/1/filter.php?c=Dessert`

> Si fallan o no devuelven datos suficientes, el proyecto usa `data/menu.json`.  
> Si también falla, usa el menú embebido en `js/main.js`.

## Cómo usar
1. Elegí ítems en cada paso (se pueden seleccionar múltiples).
2. Navegá con **Siguiente**. Si no elegís nada, el sistema te avisa.
3. En **Resumen**, revisá tu pedido y completá **Nombre** y **Email**.
4. **Confirmar** muestra un código de pedido y habilita “Hacer otro pedido”.
5. El **buscador** filtra la categoría visible; se limpia al cambiar de paso.
6. **Modo nocturno** alterna colores y queda guardado para próximas visitas.

## Claves de almacenamiento
- `pedidoCafeteria`: ítems seleccionados por categoría.
- `datosCliente`: `{ nombre, email }` del último checkout.
- `tema`: `"claro"` / `"oscuro"`.
