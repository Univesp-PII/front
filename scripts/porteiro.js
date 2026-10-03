async function submitPorteiroForm(form, data) {
  try {
    const result = await sendDataApi("api/porteiro", {
      nomePorteiro: String(data.get("nomePorteiro")).trim(),
      emailPorteiro: String(data.get("emailPorteiro")).trim().toLowerCase(),
      senhaPorteiro: String(data.get("senhaPorteiro")).trim(),
    });

    showToast(
      result.message ||
        `${formName.charAt(0).toUpperCase() + formName.slice(1)} cadastrado com sucesso!`,
      "success",
    );
    form.reset();
  } catch (error) {
    showToast(
      error.message || "Não foi possível cadastrar o porteiro.",
      "error",
    );
  }
}
