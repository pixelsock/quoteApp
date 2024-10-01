import json
import random

def generate_sample_dataset(input_file, output_file, sample_size=10):
    # Read the input JSON file
    with open(input_file, 'r') as f:
        data = json.load(f)
    
    # Generate a sample dataset
    sample_data = random.sample(data, min(sample_size, len(data)))
    
    # Write the sample dataset to the output file
    with open(output_file, 'w') as f:
        json.dump(sample_data, f, indent=2)

    print(f"Sample dataset of {len(sample_data)} items generated and saved to {output_file}")

if __name__ == "__main__":
    input_file = "src/data/output.json"
    output_file = "src/data/sample_output.json"
    generate_sample_dataset(input_file, output_file)