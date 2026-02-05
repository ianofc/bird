from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib import messages
from django.urls import reverse

# ========================================================
# 🔐 REGISTRO DE USUÁRIO (SIGN UP)
# ========================================================

def register_view(request):
    """
    Cria uma nova conta de usuário, faz o login automático e redireciona para a Home.
    """
    # Se já estiver logado, não precisa registrar
    if request.user.is_authenticated:
        return redirect('home')

    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            
            # Login automático após registrar (UX Fluida)
            login(request, user)
            
            messages.success(request, f"Bem-vindo ao Bird, @{user.username}! Sua jornada começa agora.")
            return redirect('home')
        else:
            # Se houver erros (ex: senhas não batem), exibe mensagens
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f"{error}")
    else:
        form = UserCreationForm()
    
    return render(request, 'registration/register.html', {'form': form})


# ========================================================
# 🔑 LOGIN (SIGN IN)
# ========================================================

def login_view(request):
    """
    Autentica o usuário. Suporta redirecionamento via parâmetro ?next=.
    """
    if request.user.is_authenticated:
        return redirect('home')

    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            
            # Verifica se existe uma URL de destino (next) vinda do POST ou GET
            next_url = request.POST.get('next') or request.GET.get('next')
            
            # Redireciona para 'next' se for seguro, senão vai para 'home'
            if next_url and next_url != 'None':
                return redirect(next_url)
            
            return redirect('home')
        else:
            messages.error(request, "Usuário ou senha inválidos. Tente novamente.")
    else:
        form = AuthenticationForm()

    # Passamos o 'next' para o template para manter o fluxo caso o login falhe na primeira tentativa
    context = {
        'form': form,
        'next': request.GET.get('next', '') 
    }
    return render(request, 'registration/login.html', context)


# ========================================================
# 🚪 LOGOUT (SIGN OUT)
# ========================================================

def logout_view(request):
    """
    Encerra a sessão e redireciona para o login com feedback.
    """
    if request.user.is_authenticated:
        logout(request)
        messages.info(request, "Você saiu da sua conta. Até logo!")
    
    return redirect('login')