# Guía rápida — explicado como si no supieras nada de esto

## ¿Qué hace esto, en una frase?

Miras una web desde fuera, sin tocarla, y te dice qué tiene mal configurado —
y cuánto puedes cobrar por arreglarlo.

## La analogía

Imagina que eres cerrajero y pasas por delante de una tienda. Sin entrar ni tocar
nada, ves desde la acera que: la puerta no tiene cerrojo de seguridad, la persiana
está medio subida y el cartel de la alarma es falso. No has forzado nada. Solo has
mirado lo que está a la vista de cualquiera.

Esta herramienta hace eso con páginas web. Mira tres cosas que **cualquiera puede
ver desde fuera**, sin entrar en ningún sitio:

1. **El candado del navegador** (el certificado). Si está caducado o mal puesto,
   Chrome le dice a los clientes de esa tienda "este sitio no es seguro".
2. **Las instrucciones invisibles que la web le da al navegador** (las cabeceras).
   Son como las normas de la casa. Si faltan, un atacante puede meter su propio
   contenido dentro de la web ajena.
3. **La ficha del dominio en la guía de teléfonos de internet** (el DNS). Aquí está
   lo más caro de todo: si falta un registro llamado SPF, **cualquiera puede mandar
   correos haciéndose pasar por esa empresa**. Así funcionan las facturas falsas.

## Por qué esto es dinero

Porque el dueño de la tienda no sabe nada de esto, y cuando se lo enseñas en un PDF
con su nombre arriba, entiende dos cosas a la vez: que tiene un problema y que tú
sabes arreglarlo.

La herramienta no solo detecta: **te escribe el informe y te calcula el presupuesto**.
Tú solo lo revisas y lo mandas.

Un ciclo real:
1. Ejecutas el escáner sobre 20 negocios de tu ciudad (con permiso).
2. Sale un PDF por cada uno, con su nombre, sus fallos y un precio.
3. Mandas los 5 que peor están.
4. Con que uno diga que sí, ya has cobrado.

## Cómo se usa (3 comandos)

```bash
# 1. Un dominio tuyo
node bin/wxs.js auxdesign.nl --i-am-authorized

# 2. Varios de golpe, con tarifa holandesa
node bin/wxs.js cliente1.nl cliente2.nl --i-am-authorized --market NL

# 3. Una lista entera desde un fichero
node bin/wxs.js --file clientes.txt --i-am-authorized --out informes
```

Los informes salen en la carpeta `out/`: un `.html` (para enviar, se imprime a PDF
desde el navegador) y un `.json` (los datos crudos, por si quieres hacer otra cosa
con ellos).

## Lo único importante que tienes que entender

**`--i-am-authorized` no es burocracia.** Escanear una web ajena sin permiso, aunque
sea mirando solo lo público, te pone en terreno gris. Con clientes potenciales, lo
limpio es: mandas primero un correo ofreciendo la revisión gratuita, y escaneas
cuando te dicen que sí. Eso además vende mejor, porque ya hay conversación.

## Cuando la herramienta dice "no lo sé"

A veces verás "SPF no verificable desde esta red" o "INCONCLUSO". **Eso es una virtud,
no un fallo.** Significa que la herramienta no pudo comprobarlo bien y prefiere
callarse antes que decirte una mentira que tú le repetirías a un cliente. Un escáner
que afirma "no tienes SPF" cuando sí lo tienes te deja en ridículo en la primera
reunión. Este no hace eso.
