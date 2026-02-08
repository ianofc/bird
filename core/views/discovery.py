from django.shortcuts import render
def explore_view(request):
    return render(request, 'pages/explore.html')