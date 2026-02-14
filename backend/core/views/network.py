from django.shortcuts import render
def network_view(request):
    return render(request, 'pages/network.html')