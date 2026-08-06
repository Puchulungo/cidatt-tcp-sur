// Auth gate — CIDATT TCP Sur
// Login con cuenta corporativa Microsoft (Azure AD / Grupo Euromotors).
// La verificación en 2 pasos (Authenticator, aprobación desde el celular del admin)
// ya está configurada del lado de Microsoft/Azure para la cuenta ipsa_tcp@grupoeuromotors.onmicrosoft.com
// — este código solo dispara el login estándar, no gestiona la aprobación.

const msalConfig = {
  auth: {
    clientId: "ef5d1a00-5207-4052-99b3-63366114238e",
    authority: "https://login.microsoftonline.com/1fd5f062-1288-4b1e-bd47-85287dde4d4c",
    redirectUri: window.location.origin + window.location.pathname,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

const loginRequest = { scopes: ["User.Read"] };

let msalInstance = null;

function showApp() {
  document.getElementById('auth-gate').style.display = 'none';
  document.getElementById('app-content').style.display = 'block';
  if (typeof cargarDatos === 'function') cargarDatos();
}

function showLoginButton(errorMsg) {
  document.getElementById('auth-status').style.display = 'none';
  document.getElementById('btn-login').style.display = 'flex';
  if (errorMsg) document.getElementById('auth-error').textContent = errorMsg;
}

async function initAuth() {
  msalInstance = new msal.PublicClientApplication(msalConfig);
  await msalInstance.initialize();

  try {
    const result = await msalInstance.handleRedirectPromise();
    if (result && result.account) {
      msalInstance.setActiveAccount(result.account);
      showApp();
      return;
    }
  } catch (err) {
    showLoginButton('Error al iniciar sesión. Intentá de nuevo.');
    return;
  }

  const accounts = msalInstance.getAllAccounts();
  if (accounts.length > 0) {
    msalInstance.setActiveAccount(accounts[0]);
    showApp();
  } else {
    showLoginButton();
  }
}

document.getElementById('btn-login').addEventListener('click', async () => {
  try {
    document.getElementById('auth-error').textContent = '';
    await msalInstance.loginRedirect(loginRequest);
  } catch (err) {
    document.getElementById('auth-error').textContent = 'No se pudo iniciar sesión.';
  }
});

initAuth();
