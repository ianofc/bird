from django import forms
from .models import Bird

class BirdForm(forms.ModelForm):
    class Meta:
        model = Bird
        fields = ['content', 'image']
        widgets = {
            'content': forms.Textarea(attrs={
                'class': 'w-full bg-transparent text-white text-lg placeholder-gray-500 focus:outline-none resize-none',
                'placeholder': 'O que está acontecendo?',
                'rows': 2,
                'maxlength': '280'
            }),
            'image': forms.FileInput(attrs={'class': 'hidden', 'id': 'file-input'})
        }