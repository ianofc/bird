from django.shortcuts import render
def groups_index(request):
    return render(request, 'groups/list.html')