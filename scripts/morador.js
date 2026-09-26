async function submitMoradorForm(form, data) {
  try {
    const result = await sendDataApi('morador', {
      nomeMorador: String(data.get('nomeMorador')).trim(),
      blocoMorador: String(data.get('blocoMorador')).trim(),
      apartamento: String(data.get('apartamento')).trim(),
      telefoneMorador: String(data.get('telefoneMorador')).trim(),
    });

    showToast(result.message || 'Morador cadastrado com sucesso!', 'success');
    form.reset();
  } catch (error) {
    showToast(error.message || 'Não foi possível cadastrar o morador.', 'error');
  }
}
