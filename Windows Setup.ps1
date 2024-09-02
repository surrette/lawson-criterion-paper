# Navigate to the project directory
cd C:\GitHub\lawson-criterion-paper\

# Create and activate a virtual environment
py -3 -m venv venv

# Install the dependencies
py -3 -m pip install -r requirements.txt

# Create the jupyter notebook from the .py file
jupytext --to notebook lawson-criterion-paper.py

# Run JupyterLab and open lawson-criterion-paper.ipynb
jupyter-lab lawson-criterion-paper.ipynb