import os
def parse_LOGS(log_path):
    """
    Parse the files in the specified log path.

    Args:
        log_path (str): Path to the log directory.

    Returns:
        res : A Dict , the key is the log_name , the value is the log content
    """
    res = {}  # Initialize an empty dictionary to store the parsed data
    for file_name in os.listdir(log_path):  # Iterate over each file in the log path
        f = open(os.path.join(log_path, file_name), 'r')  # Open the file in read mode
        res[file_name] = f.read()  # Read the contents of the file and store it in the dictionary using the file name as the key
    log_names = ",".join(list(os.listdir(log_path)))  # Get a comma-separated string of log names
    return res