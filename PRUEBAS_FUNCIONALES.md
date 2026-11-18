# Pruebas funcionales — Trading Global

Validación exploratoria en Expo Web el 17-11-2026. Los pedidos y datos usados son ficticios.

| Caso | Pasos y resultado esperado | Resultado |
|---|---|---|
| Catálogo inicial | Abrir Inicio; comprobar 12 productos en Tecnología, Hogar, Moda y Mascotas, con precio y stock. | Cumple |
| Búsqueda y filtros | Elegir Tecnología y buscar “audífonos”; solo aparece Audífonos inalámbricos. Buscar una palabra inexistente; aparece el mensaje de lista vacía. | Cumple |
| Favoritos | Marcar Audífonos inalámbricos y abrir Favoritos; el artículo aparece. | Cumple |
| Detalle y stock cero | Abrir un producto agotado; se ve “Agotado” y Agregar al carrito está deshabilitado. | Cumple |
| Reseñas | Registrar una calificación de 5; se muestra la confirmación y el promedio 5,0/5. | Cumple |
| Cantidades y eliminación | Agregar referencias, aumentar y disminuir una cantidad; eliminar referencias y comprobar el estado de carrito vacío. | Cumple |
| Envío | Con un subtotal menor a $150.000, el envío es $8.000; con un subtotal de $209.800, es gratis. | Cumple |
| Cupón válido | Aplicar BIENVENIDO10 a $89.900: descuento $8.990 y total $88.910 con envío. | Cumple |
| Cupón inválido | Aplicar un código desconocido; aparece el aviso y no cambia el subtotal ni se agrega descuento. | Cumple |
| Validación de comprador | Intentar revisar con el nombre vacío; se impide avanzar y se identifica el campo requerido. | Cumple |
| Compra simulada e inventario | Confirmar un pedido ficticio; aparece un código, el carrito se vacía y el stock de Audífonos inalámbricos pasa de 8 a 7. | Cumple |
| Historial | Abrir el pedido, volver a Inicio y recargar la página; el pedido permanece en el historial. | Cumple |
| Panel vendedor | Crear un producto con stock 0 y editarlo; el cambio aparece en el catálogo sin duplicar la referencia. | Cumple |
| Guardado local de favoritos | Marcar un favorito y recargar la app web; el artículo continúa en Favoritos. | Cumple |

## Pendiente antes de entregar

- Repetir las pruebas en Expo Go (Android/iOS) y verificar el guardado del carrito tras cerrar y volver a abrir la app.
- Completar la matriz del taller con cada criterio de aceptación individual, incluyendo evidencias en el dispositivo.
- Adjuntar los bocetos de Inicio/Catálogo, Detalle y Carrito; no forman parte de esta aplicación.
