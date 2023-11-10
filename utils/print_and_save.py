def print_and_save(message,log):
    print(message)
    log.append(message)
        
        
def print_arguments(func,print_file_path):
    """
    A decorator function that prints and saves the arguments passed to a function.

    Args:
        func (function): The function to be decorated.
        print_file_path (str): The path of the file to save the printed arguments.

    Returns:
        function: The decorated function.
    """
    def wrapper(*args, **kwargs):
        args_info = {f"arg{i+1}": arg for i, arg in enumerate(args)}
        kwargs_info = {key: value for key, value in kwargs.items()}

        all_arguments = {**args_info, **kwargs_info}

        print_and_save(f"Parameters >>>>>>>>>>    ",print_file_path)
        for key, value in all_arguments.items():
            print_and_save(f"       {key} : {value}", print_file_path)
        print_and_save(f"End Parameters >>>>>>>>>>   \n\n\n",print_file_path)

        return func(*args, **kwargs)

    return wrapper