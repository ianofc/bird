from django.shortcuts import render
def reels_view(request):
    return render(request, 'pages/reels.html')