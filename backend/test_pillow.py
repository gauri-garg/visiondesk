from PIL import Image

try:
    img = Image.open("app/uploads/people-working-construction-site_1048944-24148010.jpg")

    print("Format:", img.format)
    print("Mode:", img.mode)
    print("Size:", img.size)

except Exception as e:
    print(e)