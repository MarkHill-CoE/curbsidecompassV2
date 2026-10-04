import re

# Let's inspect the postal code text
with open('src/data/edmonton_postal_codes.csv', 'r') as f:
    lines = f.readlines()
print(f"Total lines in edmonton_postal_codes.csv: {len(lines)}")
