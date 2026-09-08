# Archivo público del experimento PersonText

Esta carpeta conserva copias exactas de los 14 archivos públicos autorizados del reentrenamiento local del 8 de septiembre de 2026. El helper de admisión requerido por `retrain.py` se conserva en `../evaluacion-persontext-2026-09-08/evaluation.py`. No contiene CSV, textos o identificadores de participantes, embeddings, modelos, predicciones individuales, secretos ni corridas privadas de MLflow.

El [veredicto](VEREDICTO.md) describe el experimento y sus límites: 80 adultos para desarrollo y 30 nuevos para examen, con transcripciones humanas originalmente españolas. Ninguno de los cinco rasgos supera conjuntamente los criterios conservados. Los pesos nuevos no reemplazan al `ridge_v1` publicado.

Los archivos y sus huellas se preservaron sin adaptar las rutas originales. Por eso `COMO_REPETIR.md`, el notebook y los manifiestos contienen referencias al entorno del autor. Son evidencia histórica de ejecución; esas rutas no existen automáticamente en otra computadora. La comprobación completa contra datos individuales requiere acceso autorizado a la carpeta privada, los archivos exactos y las dependencias registradas. No se promete reproducir el experimento completo sólo con este archivo público.

Desde la raíz del repositorio, con las dependencias ML instaladas, las pruebas sintéticas del protocolo sí pueden ejecutarse sin ese corpus privado:

```bash
ml/.venv/bin/python -m pytest artifacts/audits/persontext-retraining-2026-09-08/test_retrain.py -q
```

Para adaptar o volver a ejecutar el notebook, trabajar sobre una copia, configurar allí las rutas del entorno autorizado y conservar separado el notebook original con sus salidas. No ejecutar entrenamiento ni sobrescribir los resultados históricos para abrir o revisar esta evidencia. Repetir cálculos con el examen ya observado no crea una validación independiente nueva.

El [cierre integral](../../../plans/cierre-integral-2026-09-08.md) identifica los archivos actuales de la entrega. Este archivo del experimento no certifica aprobación del CAE, validez psicométrica ni operación productiva completa.
