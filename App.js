import React, { createContext, useContext, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, ScrollView, TextInput, Pressable, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

const categorias = ['Hogar', 'Tecnología', 'Moda', 'Deporte'];
const crearIdentificador = (prefijo) =>
  `${prefijo}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const productosIniciales = [
  { id: 'prod-001', nombre: 'Audífonos inalámbricos', categoria: 'Tecnología', precio: 89990, stock: 12, descripcion: 'Audífonos cómodos con conexión inalámbrica y sonido nítido.' },
  { id: 'prod-002', nombre: 'Reloj inteligente', categoria: 'Tecnología', precio: 129990, stock: 8, descripcion: 'Reloj inteligente para seguir tu actividad y tus notificaciones.' },
  { id: 'prod-003', nombre: 'Lámpara de escritorio', categoria: 'Hogar', precio: 45900, stock: 10, descripcion: 'Lámpara de luz regulable para estudiar o trabajar en casa.' },
  { id: 'prod-004', nombre: 'Organizador multiusos', categoria: 'Hogar', precio: 32900, stock: 15, descripcion: 'Organizador práctico para mantener tus espacios en orden.' },
  { id: 'prod-005', nombre: 'Camiseta básica', categoria: 'Moda', precio: 39900, stock: 20, descripcion: 'Camiseta suave de uso diario con diseño sencillo y cómodo.' },
  { id: 'prod-006', nombre: 'Mochila urbana', categoria: 'Moda', precio: 69900, stock: 9, descripcion: 'Mochila liviana con compartimentos para tus objetos diarios.' },
  { id: 'prod-007', nombre: 'Botella deportiva', categoria: 'Deporte', precio: 24900, stock: 18, descripcion: 'Botella reutilizable para mantenerte hidratado al entrenar.' },
  { id: 'prod-008', nombre: 'Colchoneta de ejercicio', categoria: 'Deporte', precio: 54900, stock: 6, descripcion: 'Colchoneta antideslizante para entrenar con mayor comodidad.' },
  { id: 'prod-009', nombre: 'Parlante portátil', categoria: 'Tecnología', precio: 75900, stock: 0, descripcion: 'Parlante compacto para escuchar música en cualquier lugar.' },
  { id: 'prod-010', nombre: 'Set de recipientes', categoria: 'Hogar', precio: 38900, stock: 11, descripcion: 'Recipientes reutilizables para guardar alimentos en casa.' },
  { id: 'prod-011', nombre: 'Gorra clásica', categoria: 'Moda', precio: 27900, stock: 14, descripcion: 'Gorra ajustable para completar un look casual y protegerte del sol.' },
  { id: 'prod-012', nombre: 'Cuerda para saltar', categoria: 'Deporte', precio: 19900, stock: 16, descripcion: 'Cuerda ajustable para ejercicios cardiovasculares en casa.' },
];

const MarketplaceContext = createContext(null);
const useMarketplace = () => useContext(MarketplaceContext);
const formatoPrecio = (valor) => `$${Math.round(valor).toLocaleString('es-CO')} COP`;

function PantallaInicio({ navigation }) {
  const { productos } = useMarketplace();
  const recomendados = productos.slice(0, 4);
  const descuentos = productos.slice(0, 2).map((producto, index) => ({
    ...producto,
    porcentaje: index === 0 ? 20 : 15,
  }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.Portada}>
        <Text style={styles.Titulo}>Comerxly</Text>
        <Text style={styles.Subtitulo}>Lo que buscas, cerca de ti.</Text>
        <Text style={styles.JustificacionMarca}>Un nombre propio que une comercio y una experiencia digital cercana.</Text>
        <Text style={styles.Des}>Un marketplace para familias y compradores de Mosquera, Madrid y Funza.</Text>
      </View>
      <View style={styles.Recuadro}>
        <Text style={styles.TituloProductos}>Populares y recomendados</Text>
        <View style={styles.GridProductos}>
          {recomendados.map((producto, index) => (
            <Pressable
              key={producto.id}
              style={styles.TarjetaProducto}
              onPress={() => navigation.navigate('DetalleProducto', { productId: producto.id })}
            >
              <Text style={styles.EtiquetaProducto}>{index % 2 ? 'Recomendado' : 'Popular'}</Text>
              <Text style={styles.NombreProducto}>{producto.nombre}</Text>
              <Text style={styles.PrecioProducto}>{formatoPrecio(producto.precio)}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.TituloProductos}>Descuentos semanales</Text>
        <View style={styles.GridProductos}>
          {descuentos.map((producto) => (
            <Pressable
              key={producto.id}
              style={styles.TarjetaDescuento}
              onPress={() => navigation.navigate('DetalleProducto', { productId: producto.id })}
            >
              <Text style={styles.Descuento}>{`-${producto.porcentaje}%`}</Text>
              <Text style={styles.NombreProducto}>{producto.nombre}</Text>
              <Text style={styles.PrecioAnterior}>{formatoPrecio(producto.precio)}</Text>
              <Text style={styles.PrecioProducto}>
                {formatoPrecio(producto.precio * (1 - producto.porcentaje / 100))}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      <StatusBar style="auto" />
    </ScrollView>
  );
}

function Catalogo({ navigation }) {
  const { productos, favoritos, cambiarFavorito, agregarAlCarrito, eliminarProducto, crearProducto } = useMarketplace();
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [categoria, setCategoria] = useState(categorias[0]);
  const [descripcion, setDescripcion] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');
  const [orden, setOrden] = useState('ninguno');

  const agregarProducto = () => {
    const precioNumerico = Number(precio);
    const stockNumerico = Number(stock);
    if (!nombre.trim() || !descripcion.trim() || descripcion.trim().length < 15) {
      Alert.alert('Revisa el producto', 'Escribe el nombre y una descripción de al menos 15 caracteres.');
      return;
    }
    if (!Number.isInteger(precioNumerico) || precioNumerico <= 0 ||
      !Number.isInteger(stockNumerico) || stockNumerico < 0) {
      Alert.alert('Datos inválidos', 'El precio debe ser positivo y el stock un entero igual o mayor a cero.');
      return;
    }
    crearProducto({
      id: crearIdentificador('prod'),
      nombre: nombre.trim(),
      categoria,
      precio: precioNumerico,
      stock: stockNumerico,
      descripcion: descripcion.trim(),
    });
    setNombre('');
    setPrecio('');
    setStock('');
    setDescripcion('');
    Alert.alert('Producto agregado', 'El producto ya está disponible en el catálogo.');
  };

  const visibles = productos
    .filter((producto) => producto.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()))
    .filter((producto) => categoriaActiva === 'Todas' || producto.categoria === categoriaActiva)
    .sort((a, b) => orden === 'asc'
      ? a.precio - b.precio
      : orden === 'desc' ? b.precio - a.precio : 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.FormularioProducto}>
        <Text style={styles.TituloFormulario}>Agregar producto</Text>
        <TextInput value={nombre} onChangeText={setNombre} placeholder="Nombre del producto" style={styles.CampoTexto} />
        <TextInput value={precio} onChangeText={setPrecio} placeholder="Precio en COP (entero)" keyboardType="number-pad" style={styles.CampoTexto} />
        <TextInput value={stock} onChangeText={setStock} placeholder="Unidades disponibles" keyboardType="number-pad" style={styles.CampoTexto} />
        <TextInput value={descripcion} onChangeText={setDescripcion} placeholder="Descripción (mínimo 15 caracteres)" style={styles.CampoTexto} />
        <View style={styles.GrupoFiltros}>
          {categorias.map((item) => (
            <Pressable key={item} style={[styles.Chip, categoria === item && styles.ChipActivo]} onPress={() => setCategoria(item)}>
              <Text style={styles.TextoChip}>{item}</Text>
            </Pressable>
          ))}
        </View>
        <Button title="Agregar al catálogo" onPress={agregarProducto} color="#d37e1d" />
      </View>

      <View style={styles.FiltrosCatalogo}>
        <TextInput value={busqueda} onChangeText={setBusqueda} placeholder="Buscar por nombre" style={styles.CampoTexto} />
        <View style={styles.GrupoFiltros}>
          {['Todas', ...categorias].map((item) => (
            <Pressable key={item} style={[styles.Chip, categoriaActiva === item && styles.ChipActivo]} onPress={() => setCategoriaActiva(item)}>
              <Text style={styles.TextoChip}>{item}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.GrupoFiltros}>
          {[['ninguno', 'Predeterminado'], ['asc', 'Menor a mayor'], ['desc', 'Mayor a menor']].map(([value, label]) => (
            <Pressable key={value} style={[styles.Chip, orden === value && styles.ChipActivo]} onPress={() => setOrden(value)}>
              <Text style={styles.TextoChip}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.ListaCatalogo}>
        {!visibles.length ? (
          <Text style={styles.textoPantalla}>
            {productos.length && (busqueda || categoriaActiva !== 'Todas') ? 'No encontramos productos' : 'No hay productos en el catálogo'}
          </Text>
        ) : visibles.map((producto) => {
          const esFavorito = favoritos.some((item) => item.id === producto.id);
          return (
            <View key={producto.id} style={styles.TarjetaCatalogo}>
              <Pressable onPress={() => navigation.navigate('DetalleProducto', { productId: producto.id })}>
                <Text style={styles.NombreProducto}>{producto.nombre}</Text>
                <Text style={styles.PrecioProducto}>{formatoPrecio(producto.precio)}</Text>
                <Text style={styles.DatoProducto}>Categoría: {producto.categoria} · {producto.stock ? `Stock: ${producto.stock}` : 'Agotado'}</Text>
              </Pressable>
              <View style={styles.AccionesProducto}>
                <Pressable style={[styles.BotonAccion, esFavorito && styles.BotonFavoritoActivo]} onPress={() => cambiarFavorito(producto)}>
                  <Text style={styles.TextoBotonAccion}>{esFavorito ? '♥ Favorito' : '♡ Favorito'}</Text>
                </Pressable>
                <Pressable style={styles.BotonAccion} onPress={() => agregarAlCarrito(producto.id)}>
                  <Text style={styles.TextoBotonAccion}>Agregar al carrito</Text>
                </Pressable>
                <Pressable style={[styles.BotonAccion, styles.BotonEliminar]} onPress={() => eliminarProducto(producto.id)}>
                  <Text style={styles.TextoBotonAccion}>Eliminar</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

function DetalleProducto({ route }) {
  const { productos, favoritos, cambiarFavorito, agregarAlCarrito } = useMarketplace();
  const producto = productos.find((item) => item.id === route.params.productId);
  if (!producto) {
    return <View style={[styles.container, styles.PantallaConMargen]}><Text style={styles.textoPantalla}>Este producto ya no está disponible.</Text></View>;
  }
  const esFavorito = favoritos.some((item) => item.id === producto.id);
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.TarjetaDetalle}>
        <Text style={styles.NombreDetalle}>{producto.nombre}</Text>
        <Text style={styles.PrecioProducto}>{formatoPrecio(producto.precio)}</Text>
        <Text style={styles.DatoProducto}>Categoría: {producto.categoria}</Text>
        <Text style={styles.DatoProducto}>Disponibilidad: {producto.stock ? `${producto.stock} unidades` : 'Agotado'}</Text>
        <Text style={styles.DescripcionProducto}>{producto.descripcion}</Text>
        <View style={styles.AccionesProducto}>
          <Pressable style={[styles.BotonAccion, esFavorito && styles.BotonFavoritoActivo]} onPress={() => cambiarFavorito(producto)}>
            <Text style={styles.TextoBotonAccion}>{esFavorito ? '♥ Quitar de favoritos' : '♡ Agregar a favoritos'}</Text>
          </Pressable>
          <Pressable style={styles.BotonPrimario} onPress={() => agregarAlCarrito(producto.id)} disabled={!producto.stock}>
            <Text style={styles.TextoBotonPrimario}>{producto.stock ? 'Agregar al carrito' : 'Agotado'}</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

function Favoritos({ navigation }) {
  const { favoritos, cambiarFavorito } = useMarketplace();
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.ListaFavoritos}>
        {!favoritos.length ? (
          <View>
            <Text style={styles.textoPantalla}>Aún no tienes productos favoritos.</Text>
            <Button title="Explorar catálogo" onPress={() => navigation.navigate('Catalogo')} color="#d37e1d" />
          </View>
        ) : favoritos.map((producto) => (
          <View key={producto.id} style={styles.TarjetaCatalogo}>
            <Pressable onPress={() => navigation.navigate('DetalleProducto', { productId: producto.id })}>
              <Text style={styles.NombreProducto}>{producto.nombre}</Text>
              <Text style={styles.PrecioProducto}>{formatoPrecio(producto.precio)}</Text>
            </Pressable>
            <Pressable style={[styles.BotonAccion, styles.BotonFavoritoActivo]} onPress={() => cambiarFavorito(producto)}>
              <Text style={styles.TextoBotonAccion}>♥ Quitar</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function PantallaCarrito({ navigation }) {
  const { productos, carrito, setCarrito, confirmarPedido } = useMarketplace();
  const [comprador, setComprador] = useState({ nombre: '', telefono: '', municipio: '', direccion: '' });
  const [revisar, setRevisar] = useState(false);
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null);
  const lineas = carrito.map((item) => ({
    ...item,
    producto: productos.find((producto) => producto.id === item.id),
  })).filter((item) => item.producto);
  const subtotal = lineas.reduce((total, item) => total + item.producto.precio * item.cantidad, 0);
  const envio = subtotal === 0 || subtotal >= 150000 ? 0 : 8000;
  const total = subtotal + envio;

  const actualizarCantidad = (id, delta) => {
    const producto = productos.find((item) => item.id === id);
    const linea = carrito.find((item) => item.id === id);
    if (delta > 0 && linea.cantidad >= producto.stock) {
      Alert.alert('Stock insuficiente', 'No hay más unidades disponibles de este producto.');
      return;
    }
    setCarrito((actual) => actual
      .map((item) => item.id === id ? { ...item, cantidad: item.cantidad + delta } : item)
      .filter((item) => item.cantidad > 0));
  };

  const continuar = () => {
    const faltante = Object.entries(comprador).find(([, valor]) => !valor.trim());
    if (!lineas.length) {
      Alert.alert('Carrito vacío', 'Agrega al menos un producto antes de continuar.');
      return;
    }
    if (faltante) {
      Alert.alert('Completa tus datos', `Falta ingresar: ${faltante[0]}.`);
      return;
    }
    setRevisar(true);
  };

  const finalizarCompra = () => {
    const resultado = confirmarPedido(comprador);
    if (!resultado.ok) {
      Alert.alert('No se pudo confirmar', resultado.mensaje);
      setRevisar(false);
      return;
    }
    setPedidoConfirmado(resultado.pedido);
  };

  if (pedidoConfirmado) {
    return (
      <View style={[styles.container, styles.PantallaConMargen]}>
        <Text style={styles.TituloFormulario}>¡Pedido simulado!</Text>
        <Text style={styles.textoPantalla}>Código: {pedidoConfirmado.codigo}</Text>
        <Text style={styles.textoPantalla}>Total: {formatoPrecio(pedidoConfirmado.total)}</Text>
        <Text style={styles.DatoProducto}>No se realizó ningún cobro.</Text>
        <Button title="Ver historial" onPress={() => navigation.navigate('Historial')} color="#d37e1d" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {!lineas.length ? (
        <View style={styles.EstadoVacio}>
          <Text style={styles.textoPantalla}>Tu carrito está vacío.</Text>
          <Button title="Ir al catálogo" onPress={() => navigation.navigate('Catalogo')} color="#d37e1d" />
        </View>
      ) : lineas.map((item) => (
        <View key={item.id} style={styles.TarjetaCatalogo}>
          <Text style={styles.NombreProducto}>{item.producto.nombre}</Text>
          <Text style={styles.PrecioProducto}>{formatoPrecio(item.producto.precio)}</Text>
          <View style={styles.AccionesProducto}>
            <Pressable style={styles.BotonAccion} onPress={() => actualizarCantidad(item.id, -1)}><Text style={styles.TextoBotonAccion}>−</Text></Pressable>
            <Text style={styles.Cantidad}>{item.cantidad}</Text>
            <Pressable style={styles.BotonAccion} onPress={() => actualizarCantidad(item.id, 1)}><Text style={styles.TextoBotonAccion}>+</Text></Pressable>
            <Pressable style={[styles.BotonAccion, styles.BotonEliminar]} onPress={() => setCarrito((actual) => actual.filter((linea) => linea.id !== item.id))}>
              <Text style={styles.TextoBotonAccion}>Eliminar</Text>
            </Pressable>
          </View>
        </View>
      ))}

      {!!lineas.length && (
        <View style={styles.Resumen}>
          <Text style={styles.DatoProducto}>Subtotal: {formatoPrecio(subtotal)}</Text>
          <Text style={styles.DatoProducto}>Envío: {envio ? formatoPrecio(envio) : 'Gratis'}</Text>
          <Text style={styles.TituloFormulario}>Total: {formatoPrecio(total)}</Text>
          {!revisar ? (
            <View>
              <Text style={styles.TituloFormulario}>Datos de entrega</Text>
              {[
                ['nombre', 'Nombre'],
                ['telefono', 'Teléfono'],
                ['municipio', 'Municipio'],
                ['direccion', 'Dirección'],
              ].map(([campo, etiqueta]) => (
                <TextInput
                  key={campo}
                  value={comprador[campo]}
                  onChangeText={(valor) => setComprador((actual) => ({ ...actual, [campo]: valor }))}
                  placeholder={etiqueta}
                  style={styles.CampoTexto}
                  keyboardType={campo === 'telefono' ? 'phone-pad' : 'default'}
                />
              ))}
              <Button title="Revisar pedido" onPress={continuar} color="#d37e1d" />
            </View>
          ) : (
            <View>
              <Text style={styles.TituloFormulario}>Revisa antes de confirmar</Text>
              <Text style={styles.DatoProducto}>Entrega: {comprador.nombre}, {comprador.direccion}, {comprador.municipio}</Text>
              <Text style={styles.DatoProducto}>Compra académica simulada, sin cobro real.</Text>
              <Button title="Confirmar compra simulada" onPress={finalizarCompra} color="#d37e1d" />
              <Button title="Volver a editar" onPress={() => setRevisar(false)} />
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

function PantallaHistorial({ navigation }) {
  const { historial } = useMarketplace();
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {!historial.length ? (
        <View style={styles.EstadoVacio}><Text style={styles.textoPantalla}>Aún no hay pedidos registrados.</Text></View>
      ) : historial.map((pedido) => (
        <Pressable key={pedido.codigo} style={styles.TarjetaCatalogo} onPress={() => navigation.navigate('DetallePedido', { orderId: pedido.codigo })}>
          <Text style={styles.NombreProducto}>Pedido {pedido.codigo}</Text>
          <Text style={styles.DatoProducto}>{pedido.fecha}</Text>
          <Text style={styles.PrecioProducto}>{formatoPrecio(pedido.total)}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function DetallePedido({ route }) {
  const { historial } = useMarketplace();
  const pedido = historial.find((item) => item.codigo === route.params.orderId);
  if (!pedido) return <View style={[styles.container, styles.PantallaConMargen]}><Text style={styles.textoPantalla}>No encontramos ese pedido.</Text></View>;
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.Resumen}>
        <Text style={styles.TituloFormulario}>Pedido {pedido.codigo}</Text>
        {pedido.lineas.map((linea) => (
          <Text key={linea.id} style={styles.DatoProducto}>{linea.nombre} · {linea.cantidad} × {formatoPrecio(linea.precio)}</Text>
        ))}
        <Text style={styles.DatoProducto}>Envío: {pedido.envio ? formatoPrecio(pedido.envio) : 'Gratis'}</Text>
        <Text style={styles.TituloFormulario}>Total: {formatoPrecio(pedido.total)}</Text>
      </View>
    </ScrollView>
  );
}

const Stack = createStackNavigator();

export default function App() {
  const [productos, setProductos] = useState(productosIniciales);
  const [favoritos, setFavoritos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [datosCargados, setDatosCargados] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const datosGuardados = await AsyncStorage.getItem('comerxly-datos-v1');
        if (datosGuardados) {
          const datos = JSON.parse(datosGuardados);
          if (Array.isArray(datos.productos)) setProductos(datos.productos);
          if (Array.isArray(datos.favoritos)) setFavoritos(datos.favoritos);
          if (Array.isArray(datos.carrito)) setCarrito(datos.carrito);
          if (Array.isArray(datos.historial)) setHistorial(datos.historial);
        }
      } catch (error) {
        console.error('No se pudieron cargar los datos:', error);
      } finally {
        setDatosCargados(true);
      }
    };

    cargarDatos();
  }, []);

  useEffect(() => {
    if (!datosCargados) return;

    AsyncStorage.setItem('comerxly-datos-v1', JSON.stringify({
      productos,
      favoritos,
      carrito,
      historial,
    })).catch((error) => {
      console.error('No se pudieron guardar los datos:', error);
    });
  }, [productos, favoritos, carrito, historial, datosCargados]);

  const agregarAlCarrito = (id) => {
    const producto = productos.find((item) => item.id === id);
    if (!producto || producto.stock <= 0) {
      Alert.alert('Producto agotado', 'Este producto no tiene unidades disponibles.');
      return;
    }
    const cantidadActual = carrito.find((item) => item.id === id)?.cantidad || 0;
    if (cantidadActual >= producto.stock) {
      Alert.alert('Stock insuficiente', 'Ya agregaste todas las unidades disponibles.');
      return;
    }
    setCarrito((actual) => {
      const linea = actual.find((item) => item.id === id);
      return linea
        ? actual.map((item) => item.id === id ? { ...item, cantidad: item.cantidad + 1 } : item)
        : [...actual, { id, cantidad: 1 }];
    });
    Alert.alert('Agregado', `${producto.nombre} se agregó al carrito.`);
  };

  const cambiarFavorito = (producto) => {
    setFavoritos((actual) => actual.some((item) => item.id === producto.id)
      ? actual.filter((item) => item.id !== producto.id)
      : [...actual, producto]);
  };

  const eliminarProducto = (id) => {
    setProductos((actual) => actual.filter((item) => item.id !== id));
    setFavoritos((actual) => actual.filter((item) => item.id !== id));
    setCarrito((actual) => actual.filter((item) => item.id !== id));
  };

  const confirmarPedido = (comprador) => {
    const lineas = carrito.map((item) => {
      const producto = productos.find((actual) => actual.id === item.id);
      return producto ? { producto, cantidad: item.cantidad } : null;
    });
    if (!lineas.length || lineas.some((linea) => !linea ||
      !Number.isInteger(linea.cantidad) || linea.cantidad < 1 ||
      linea.cantidad > linea.producto.stock)) {
      return { ok: false, mensaje: 'El stock cambió o un producto ya no está disponible. Revisa tu carrito.' };
    }

    const subtotal = lineas.reduce((total, linea) =>
      total + linea.producto.precio * linea.cantidad, 0);
    const envio = subtotal > 0 && subtotal < 150000 ? 8000 : 0;
    const codigo = crearIdentificador('CX');
    const pedido = {
      codigo,
      fecha: new Date().toLocaleString('es-CO'),
      comprador: { ...comprador },
      lineas: lineas.map(({ producto, cantidad }) => ({
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad,
      })),
      subtotal,
      envio,
      total: subtotal + envio,
    };

    setProductos((actual) => actual.map((producto) => {
      const linea = lineas.find((item) => item.producto.id === producto.id);
      return linea ? { ...producto, stock: producto.stock - linea.cantidad } : producto;
    }));
    setHistorial((actual) => [pedido, ...actual]);
    setCarrito([]);
    return { ok: true, pedido };
  };

  const marketplace = {
    productos,
    favoritos,
    carrito,
    setCarrito,
    historial,
    cambiarFavorito,
    agregarAlCarrito,
    eliminarProducto,
    crearProducto: (producto) => setProductos((actual) => [...actual, producto]),
    confirmarPedido,
  };

  return (
    <MarketplaceContext.Provider value={marketplace}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#1e293b' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        >
          <Stack.Screen
            name="Inicio"
            component={PantallaInicio}
            options={({ navigation }) => ({
              title: 'Comerxly',
              headerRight: () => (
                <View style={styles.NavegacionHeader}>
                  <Button onPress={() => navigation.navigate('Catalogo')} title="Catálogo" color="#d37e1d" />
                  <Button onPress={() => navigation.navigate('Favoritos')} title="Favoritos" color="#d37e1d" />
                  <Button onPress={() => navigation.navigate('Carrito')} title="Carrito" color="#d37e1d" />
                  <Button onPress={() => navigation.navigate('Historial')} title="Historial" color="#d37e1d" />
                </View>
              ),
            })}
          />
          <Stack.Screen name="Catalogo" component={Catalogo} options={{ title: 'Catálogo de productos' }} />
          <Stack.Screen name="DetalleProducto" component={DetalleProducto} options={{ title: 'Detalle del producto' }} />
          <Stack.Screen name="Favoritos" component={Favoritos} options={{ title: 'Mis favoritos' }} />
          <Stack.Screen name="Carrito" component={PantallaCarrito} options={{ title: 'Carrito de compras' }} />
          <Stack.Screen name="Historial" component={PantallaHistorial} options={{ title: 'Historial de pedidos' }} />
          <Stack.Screen name="DetallePedido" component={DetallePedido} options={{ title: 'Detalle del pedido' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </MarketplaceContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#bdc5bfcd',
  },
  containerCentro: {
    flex: 1,
    backgroundColor: '#bdc5bfcd',
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  NavegacionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
  },
  Portada: {
    padding: 25,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  Titulo: {
    color: '#d37e1d',
    fontSize: 40,
    fontWeight: 'bold',
  },
  Subtitulo: {
    color: '#333',
    fontSize: 16,
  },
  JustificacionMarca: {
    marginTop: 8,
    color: '#475569',
    fontSize: 15,
    fontStyle: 'italic',
  },
  Des: {
    fontSize: 17,
    color: '#333',
  },
  Recuadro: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginVertical: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
  },
  TituloProductos: {
    marginTop: 18,
    marginBottom: 12,
    color: '#1e293b',
    fontSize: 21,
    fontWeight: 'bold',
  },
  GridProductos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  TarjetaProducto: {
    width: '48%',
    minWidth: 150,
    flexGrow: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#d7dde5',
    borderRadius: 8,
    padding: 14,
  },
  TarjetaDescuento: {
    width: '48%',
    minWidth: 150,
    flexGrow: 1,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#d37e1d',
    borderRadius: 8,
    padding: 14,
  },
  Descuento: {
    alignSelf: 'flex-start',
    backgroundColor: '#b91c1c',
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    borderRadius: 12,
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  PrecioAnterior: {
    marginTop: 8,
    color: '#64748b',
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  EtiquetaProducto: {
    alignSelf: 'flex-start',
    backgroundColor: '#d37e1d',
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    borderRadius: 12,
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  NombreProducto: {
    marginTop: 10,
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  PrecioProducto: {
    marginTop: 8,
    color: '#d37e1d',
    fontSize: 17,
    fontWeight: 'bold',
  },
  DatoProducto: {
    marginTop: 6,
    color: '#475569',
    fontSize: 15,
  },
  FiltrosCatalogo: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
  },
  GrupoFiltros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  Chip: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  ChipActivo: {
    backgroundColor: '#d37e1d',
    borderColor: '#d37e1d',
  },
  TextoChip: {
    color: '#1e293b',
    fontWeight: '600',
  },
  TarjetaDetalle: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d7dde5',
  },
  NombreDetalle: {
    color: '#1e293b',
    fontSize: 26,
    fontWeight: 'bold',
  },
  DescripcionProducto: {
    marginTop: 16,
    marginBottom: 20,
    color: '#333',
    fontSize: 17,
    lineHeight: 24,
  },
  BotonPrimario: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  TextoBotonPrimario: {
    color: '#fff',
    fontWeight: 'bold',
  },
  Resumen: {
    margin: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d7dde5',
  },
  Cantidad: {
    alignSelf: 'center',
    minWidth: 28,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#1e293b',
  },
  EstadoVacio: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    gap: 12,
  },
  PantallaConMargen: {
    padding: 20,
  },
  FormularioProducto: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d7dde5',
    borderRadius: 10,
    padding: 16,
  },
  TituloFormulario: {
    marginBottom: 12,
    color: '#1e293b',
    fontSize: 20,
    fontWeight: 'bold',
  },
  CampoTexto: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#94a3b8',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#333',
  },
  ListaCatalogo: {
    marginHorizontal: 20,
    marginTop: 12,
  },
  ListaFavoritos: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  TarjetaCatalogo: {
    marginBottom: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d7dde5',
    borderRadius: 10,
    padding: 14,
  },
  InfoProducto: {
    marginBottom: 10,
  },
  AccionesProducto: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  BotonAccion: {
    borderWidth: 1,
    borderColor: '#d37e1d',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  BotonFavoritoActivo: {
    backgroundColor: '#d37e1d',
  },
  BotonEliminar: {
    borderColor: '#b91c1c',
  },
  TextoBotonAccion: {
    color: '#333',
    fontWeight: 'bold',
  },
  textoPantalla: {
    color: '#333',
    fontSize: 18,
  },
  centro: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});