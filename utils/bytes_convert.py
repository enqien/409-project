def convert_bytes(byte_value):
    """
    Converts a size in bytes to a formatted string with appropriate units.

    Args:
        byte_value (int): The size in bytes.

    Returns:
        str: Formatted string representing the converted size with appropriate unit.
    """
    kilo = 1024
    mega = kilo ** 2
    giga = kilo ** 3

    if byte_value < kilo:
        return f"{byte_value} B"  # Convert bytes to string with 'B' unit
    elif byte_value < mega:
        return f"{int(byte_value / kilo)}KB"  # Convert to kilobytes
    elif byte_value < giga:
        return f"{int(byte_value / mega)}MB"  # Convert to megabytes
    else:
        return f"{int(byte_value / giga)}GB"  # Convert to gigabytes
        


def convert_to_bytes(size):
    """
    Converts a size string to its equivalent size in bytes.

    Args:
        size (str): The size in the format "<number><unit>" (e.g., "1KB", "10MB", "2GB").

    Returns:
        int: Converted size in bytes.

    Raises:
        ValueError: If the size format is invalid.

    Example:
        convert_to_bytes("2KB")  # Returns: 2048

    Note:
        The expected format for the size argument is <number><unit>, where <number> is a positive integer and <unit>
        can be one of the following: 'KB' for kilobytes, 'MB' for megabytes, or 'GB' for gigabytes.
        If the provided size does not match the expected format, a ValueError exception is raised.
    """
    kilo = 1024
    mega = kilo ** 2
    giga = kilo ** 3

    if size.endswith('KB'):
        return int(size[:-2]) * kilo
    elif size.endswith('MB'):
        return int(size[:-2]) * mega
    elif size.endswith('GB'):
        return int(size[:-2]) * giga
    else:
        raise ValueError("Invalid size format. Expected format: <number><unit> (e.g., 1KB, 10MB, 2GB)")