"""
PDF Generator using Gotenberg

This module handles PDF generation from HTML content using Gotenberg service.
"""

import os
import requests
import tempfile
import re
from typing import Optional

class PDFGenerator:
    """Handles PDF generation from HTML content using Gotenberg"""
    
    def __init__(self, gotenberg_url: str = "http://gotenberg:3000"):
        """
        Initialize the PDF generator with Gotenberg service URL
        
        Args:
            gotenberg_url: URL of the Gotenberg service, defaults to http://gotenberg:3000
        """
        self.gotenberg_url = gotenberg_url
    
    def generate_pdf_from_html(self, html_content: str, output_path: str) -> bool:
        """
        Generate a PDF from HTML using Gotenberg.

        Args:
            html_content: The HTML content to convert
            output_path: Path where to save the PDF

        Returns:
            True if successful, False otherwise
        """
        try:
            # Modify the HTML to ensure fonts display in PDF
            html_content = self._modify_html_for_pdf(html_content)
            
            # Save debug HTML for troubleshooting
            debug_path = "debug_input.html"
            with open(debug_path, "w", encoding="utf-8") as debug_file:
                debug_file.write(html_content)
            print(f"Saved HTML content to {debug_path} for debugging")
            
            # Create output directory if it doesn't exist
            os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
            
            # Create a temporary file for the HTML content
            with tempfile.NamedTemporaryFile(suffix='.html', delete=False, mode='w', encoding='utf-8') as temp_html:
                temp_html.write(html_content)
                temp_html_path = temp_html.name
                print(f"Created temporary HTML file at {temp_html_path}")
            
            try:
                # Open the file in binary mode for requests
                with open(temp_html_path, 'rb') as html_file:
                    # Prepare files dict for multipart/form-data request
                    files = {
                        'index.html': ('index.html', html_file, 'text/html')
                    }
                    
                    # Make the API request to Gotenberg
                    endpoint = f"{self.gotenberg_url}/forms/chromium/convert/html"
                    print(f"Sending request to Gotenberg at: {endpoint}")
                    
                    response = requests.post(
                        endpoint,
                        files=files,
                        data={
                            'marginTop': '0.5',
                            'marginBottom': '0.5',
                            'marginLeft': '0.5',
                            'marginRight': '0.5',
                            'paperWidth': '8.5',
                            'paperHeight': '11',
                            'printBackground': 'true',
                            'waitDelay': '2s',
                            'preferCSSPageSize': 'false',
                            'scale': '1.0'
                        },
                        timeout=30  # 30 second timeout
                    )
                    
                    # Check if the request was successful
                    if response.status_code == 200:
                        # Save the PDF content to the output path
                        with open(output_path, 'wb') as pdf_file:
                            pdf_file.write(response.content)
                        
                        print(f"PDF successfully generated at {output_path}")
                        return True
                    else:
                        print(f"Gotenberg API error: {response.status_code} - {response.text}")
                        return False
                    
            finally:
                # Clean up temporary file
                try:
                    os.unlink(temp_html_path)
                except Exception as unlink_error:
                    print(f"Warning: Failed to delete temp file {temp_html_path}: {unlink_error}")
        
        except Exception as e:
            print(f"Error generating PDF with Gotenberg: {e}")
            return False
    
    def _modify_html_for_pdf(self, html_content: str) -> str:
        """
        Modify HTML to ensure fonts render properly in PDF output
        
        Args:
            html_content: Original HTML content
            
        Returns:
            Modified HTML content
        """
        # Add system fonts as fallbacks in case Google Fonts fail to load
        html_content = re.sub(
            r"font-family:\s*'Inter',\s*sans-serif", 
            "font-family: 'Inter', Arial, Helvetica, sans-serif", 
            html_content
        )
        
        # Ensure the Google Fonts are embedded directly
        if "<link href=\"https://fonts.googleapis.com/css2?family=Inter:" in html_content:
            # Add preconnect for Google Fonts
            preconnect = """
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
"""
            html_content = html_content.replace("<head>", f"<head>\n{preconnect}")
            
            # Force font loading with a hidden element
            font_loader = """
<style>
/* Make sure fonts are forced to load */
body::before {
  content: 'Font Loader';
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-weight: 500;
  font-weight: 600;
  font-weight: 700;
  position: absolute;
  height: 0;
  width: 0;
  overflow: hidden;
  opacity: 0;
}
</style>
"""
            # Add before closing head tag
            html_content = html_content.replace("</head>", f"{font_loader}\n</head>")
        
        return html_content