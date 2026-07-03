-- exam_results nunca tuvo policy de UPDATE (solo INSERT/SELECT), por lo que
-- assignProcessCodeToExamAction actualizaba 0 filas en silencio: el candidato
-- veía "código asignado correctamente" pero al recargar el process_code
-- seguía en null. La app ya valida ownership y que process_code sea null
-- antes de llamar al update (ver assignProcessCodeToExamAction), así que acá
-- solo habilitamos que el dueño de la fila pueda actualizarla.

CREATE POLICY "Users update own results"
  ON public.exam_results
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
