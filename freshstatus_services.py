#!/usr/bin/env python3
"""
Freshstatus API Script - Get All Services
Retrieves all services from your Freshstatus status page.
"""

import requests
import json
import base64
from typing import Dict, List, Optional

class FreshstatusClient:
    """Client for interacting with Freshstatus API"""
    
    def __init__(self, api_key: str, subdomain: str):
        """
        Initialize the Freshstatus client
        
        Args:
            api_key (str): Your Freshstatus API key
            subdomain (str): Your Freshstatus subdomain (e.g., 'xyz' for xyz.freshstatus.io)
        """
        self.api_key = api_key
        self.subdomain = subdomain
        self.base_url = "https://public-api.freshstatus.io/api/v1"
        self.session = requests.Session()
        
        # Set up authentication headers
        auth_string = f"{api_key}:{subdomain}"
        auth_bytes = auth_string.encode('ascii')
        auth_b64 = base64.b64encode(auth_bytes).decode('ascii')
        
        self.session.headers.update({
            'Authorization': f'Basic {auth_b64}',
            'Content-Type': 'application/json'
        })
    
    def get_all_services(self) -> Optional[Dict]:
        """
        Retrieve all services from Freshstatus
        
        Returns:
            Dict: API response containing services data, or None if error
        """
        try:
            url = f"{self.base_url}/services/"
            response = self.session.get(url)
            response.raise_for_status()
            return response.json()
        
        except requests.exceptions.RequestException as e:
            print(f"Error fetching services: {e}")
            return None
    
    def get_service_by_id(self, service_id: int) -> Optional[Dict]:
        """
        Retrieve a specific service by ID
        
        Args:
            service_id (int): ID of the service to retrieve
            
        Returns:
            Dict: Service data, or None if error
        """
        try:
            url = f"{self.base_url}/services/{service_id}/"
            response = self.session.get(url)
            response.raise_for_status()
            return response.json()
        
        except requests.exceptions.RequestException as e:
            print(f"Error fetching service {service_id}: {e}")
            return None
    
    def print_services_summary(self, services_data: Dict) -> None:
        """
        Print a formatted summary of services
        
        Args:
            services_data (Dict): Services data from API response
        """
        if not services_data or 'results' not in services_data:
            print("No services data available")
            return
        
        services = services_data['results']
        total_count = services_data.get('count', len(services))
        
        print(f"\n=== FRESHSTATUS SERVICES SUMMARY ===")
        print(f"Total Services: {total_count}")
        print(f"Services Retrieved: {len(services)}")
        print("=" * 50)
        
        for service in services:
            print(f"\nService ID: {service.get('id')}")
            print(f"Name: {service.get('name')}")
            print(f"Description: {service.get('description', 'N/A')}")
            print(f"Status: {service.get('status', 'Unknown')}")
            print(f"Order: {service.get('order')}")
            
            # Display group information if available
            group = service.get('group')
            if group:
                print(f"Group: {group.get('name')} (ID: {group.get('id')})")
            else:
                print("Group: None")
            
            # Display options if available
            display_options = service.get('display_options', {})
            if display_options:
                start_date = display_options.get('service_start_date', 'N/A')
                uptime_enabled = display_options.get('uptime_history_enabled', 'N/A')
                print(f"Service Start Date: {start_date}")
                print(f"Uptime History Enabled: {uptime_enabled}")
            
            print("-" * 30)

def main():
    """Main function to demonstrate usage"""
    
    # Configuration - Replace with your actual values
    API_KEY = "your_api_key_here"  # Replace with your actual API key
    SUBDOMAIN = "benchmarkeducation"   # Your Freshstatus subdomain
    
    # Validate configuration
    if API_KEY == "your_api_key_here":
        print("⚠️  Please update the API_KEY variable with your actual API key")
        print("\nTo find your API key:")
        print("1. Login to your Freshstatus account at https://benchmarkeducation.freshstatus.io/")
        print("2. Go to Settings > Account")
        print("3. Copy API Key")
        return
    
    # Initialize client
    client = FreshstatusClient(API_KEY, SUBDOMAIN)
    
    # Fetch all services
    print("Fetching all services from Freshstatus...")
    services_data = client.get_all_services()
    
    if services_data:
        # Print summary
        client.print_services_summary(services_data)
        
        # Optionally save to file
        save_to_file = input("\nSave results to JSON file? (y/n): ").lower().strip()
        if save_to_file == 'y':
            filename = "freshstatus_services.json"
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(services_data, f, indent=2, ensure_ascii=False)
            print(f"Results saved to {filename}")
    
    else:
        print("Failed to retrieve services. Please check your API credentials and network connection.")

if __name__ == "__main__":
    main()
