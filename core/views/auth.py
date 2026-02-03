from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib import messages

# ========================================================
# 🔐 REGISTRO DE USUÁRIO
# ========================================================

def register_view(request):
    """
    Cria uma nova conta de usuário e faz o login automático.
    """
    if request.user.is_authenticated:
        return redirect('home')

    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            
            # Login automático após registrar
            login(request, user)
            
            messages.success(request, f"Bem-vindo ao Bird, @{user.username}!")
            return redirect('home')
        else:
            messages.error(request, "Erro ao criar conta. Verifique os dados informados.")
    else:
        form = UserCreationForm()
    
    return render(request, 'registration/register.html', {'form': form})


# ========================================================
# 🔑 LOGIN
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
            
            # Verifica se existe uma URL de destino (next)
            next_url = request.POST.get('next')
            if next_url and next_url != 'None':
                return redirect(next_url)
            
            return redirect('home')
        else:
            messages.error(request, "Usuário ou senha inválidos.")
    else:
        form = AuthenticationForm()

    # Passamos o 'next' para o template para manter o fluxo caso o login falhe
    context = {
        'form': form,
        'next': request.GET.get('next', '') 
    }
    return render(request, 'registration/login.html', context)


# ========================================================
# 🚪 LOGOUT
# ========================================================

def logout_view(request):
    """
    Encerra a sessão e redireciona para o login.
    """
    logout(request)
    messages.info(request, "Você saiu da sua conta.")
    return redirect('login')