# Incidencia detectada antes del entrenamiento

8 de septiembre de 2026. La primera ejecución se detuvo en admisión por `Duplicate normalized text`. No se había creado `training-start.json`, entrenado regresores ni calculado predicciones del test.

La revisión de v2 detectó un grupo de dos respuestas normalizadas idénticas, de 15 palabras, pertenecientes al **mismo UID nuevo**. Afecta a una sola persona, no hay duplicación detectada entre dos UID nuevos. El archivo original se conserva byte por byte.

Se agrega una limpieza explícita, previa a cualquier ajuste: cuando un UID repite el mismo texto normalizado y coinciden edad, cinco valores y cinco etiquetas, conservar la primera ocurrencia. Si difieren esos campos, detenerse; no escoger cuál es correcta. Duplicados entre personas o contra desarrollo/histórico siguen rechazados.

Desarrollo permanece en 80 adultos/210 textos. El test conserva sus 30 adultos, con **89 textos únicos de 90 registros recibidos**. No se crea una persona, se duplica una etiqueta para ganar muestra ni se cambia el umbral n≥30. El conteo de registros excluidos se conserva en el manifiesto.

Esta adenda documenta la modificación del protocolo antes de entrenar/evaluar; no es una limpieza elegida por resultados favorables. Todos los demás métodos, comparadores y criterios permanecen iguales.
