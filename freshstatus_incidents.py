#!/usr/bin/env python3
"""
Freshstatus API Script - Get All Incidents
Retrieves all incidents from your Freshstatus status page.
"""

import requests
import json
import base64
from datetime import datetime
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
    
    def get_all_incidents(self) -> Optional[Dict]:
        """
        Retrieve all incidents from Freshstatus
        
        Returns:
            Dict: API response containing incidents data, or None if error
        """
        try:
            url = f"{self.base_url}/incidents/"
            response = self.session.get(url)
            response.raise_for_status()
            return response.json()
        
        except requests.exceptions.RequestException as e:
            print(f"Error fetching incidents: {e}")
            return None
    
    def get_incident_by_id(self, incident_id: int) -> Optional[Dict]:
        """
        Retrieve a specific incident by ID
        
        Args:
            incident_id (int): ID of the incident to retrieve
            
        Returns:
            Dict: Incident data, or None if error
        """
        try:
            url = f"{self.base_url}/incidents/{incident_id}/"
            response = self.session.get(url)
            response.raise_for_status()
            return response.json()
        
        except requests.exceptions.RequestException as e:
            print(f"Error fetching incident {incident_id}: {e}")
            return None
    
    def get_incident_updates(self, incident_id: int) -> Optional[Dict]:
        """
        Retrieve updates for a specific incident
        
        Args:
            incident_id (int): ID of the incident
            
        Returns:
            Dict: Incident updates data, or None if error
        """
        try:
            url = f"{self.base_url}/incident-updates/?incident={incident_id}"
            response = self.session.get(url)
            response.raise_for_status()
            return response.json()
        
        except requests.exceptions.RequestException as e:
            print(f"Error fetching updates for incident {incident_id}: {e}")
            return None
    
    def format_datetime(self, datetime_str: str) -> str:
        """
        Format datetime string for better readability
        
        Args:
            datetime_str (str): UTC datetime string
            
        Returns:
            str: Formatted datetime string
        """
        try:
            dt = datetime.fromisoformat(datetime_str.replace('Z', '+00:00'))
            return dt.strftime('%Y-%m-%d %H:%M:%S UTC')
        except:
            return datetime_str
    
    def get_status_display(self, status_code: str) -> str:
        """
        Convert status codes to readable format
        
        Args:
            status_code (str): Status code from API
            
        Returns:
            str: Human readable status
        """
        status_map = {
            'OP': 'Operational',
            'PD': 'Performance Degraded', 
            'PO': 'Partial Outage',
            'MO': 'Major Outage',
            'UM': 'Under Maintenance'
        }
        return status_map.get(status_code, status_code)
    
    def print_incidents_summary(self, incidents_data: Dict) -> None:
        """
        Print a formatted summary of incidents
        
        Args:
            incidents_data (Dict): Incidents data from API response
        """
        if not incidents_data or 'results' not in incidents_data:
            print("No incidents data available")
            return
        
        incidents = incidents_data['results']
        total_count = incidents_data.get('count', len(incidents))
        
        print(f"\n=== FRESHSTATUS INCIDENTS SUMMARY ===")
        print(f"Total Incidents: {total_count}")
        print(f"Incidents Retrieved: {len(incidents)}")
        print("=" * 60)
        
        for incident in incidents:
            print(f"\nIncident ID: {incident.get('id')}")
            print(f"Title: {incident.get('title')}")
            print(f"Description: {incident.get('description', 'N/A')}")
            
            # Format dates
            start_time = incident.get('start_time')
            end_time = incident.get('end_time')
            if start_time:
                print(f"Start Time: {self.format_datetime(start_time)}")
            if end_time:
                print(f"End Time: {self.format_datetime(end_time)}")
            
            # Privacy status
            is_private = incident.get('is_private', False)
            print(f"Private: {'Yes' if is_private else 'No'}")
            
            # Affected components
            affected_components = incident.get('affected_components', [])
            if affected_components:
                print("Affected Components:")
                for component in affected_components:
                    comp_id = component.get('component')
                    new_status = component.get('new_status')
                    status_display = self.get_status_display(new_status)
                    print(f"  - Component {comp_id}: {status_display}")
            else:
                print("Affected Components: None")
            
            # Notification options
            notification_options = incident.get('notification_options', {})
            if notification_options:
                send_email = notification_options.get('send_email', 'N/A')
                send_tweet = notification_options.get('send_tweet', 'N/A')
                print(f"Notifications - Email: {send_email}, Twitter: {send_tweet}")
            
            # Incident updates count
            incident_updates = incident.get('incident_updates', [])
            print(f"Number of Updates: {len(incident_updates)}")
            
            print("-" * 50)
    
    def print_detailed_incident(self, incident_id: int) -> None:
        """
        Print detailed information for a specific incident including updates
        
        Args:
            incident_id (int): ID of the incident
        """
        print(f"\n=== DETAILED INCIDENT REPORT: {incident_id} ===")
        
        # Get incident details
        incident = self.get_incident_by_id(incident_id)
        if not incident:
            print(f"Could not retrieve incident {incident_id}")
            return
        
        # Print basic incident info
        print(f"Title: {incident.get('title')}")
        print(f"Description: {incident.get('description', 'N/A')}")
        
        start_time = incident.get('start_time')
        end_time = incident.get('end_time')
        if start_time:
            print(f"Start Time: {self.format_datetime(start_time)}")
        if end_time:
            print(f"End Time: {self.format_datetime(end_time)}")
        
        # Get and display updates
        updates_data = self.get_incident_updates(incident_id)
        if updates_data and updates_data.get('results'):
            updates = updates_data['results']
            print(f"\nIncident Updates ({len(updates)}):")
            print("=" * 40)
            
            for update in updates:
                print(f"\nUpdate ID: {update.get('id')}")
                print(f"Message: {update.get('message', 'N/A')}")
                
                update_time = update.get('time')
                if update_time:
                    print(f"Time: {self.format_datetime(update_time)}")
                
                print(f"Status: {update.get('incident_status', 'N/A')}")
                print(f"Private: {'Yes' if update.get('is_private', False) else 'No'}")
                print("-" * 30)
        else:
            print("\nNo updates found for this incident")

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
    
    # Fetch all incidents
    print("Fetching all incidents from Freshstatus...")
    incidents_data = client.get_all_incidents()
    
    if incidents_data:
        # Print summary
        client.print_incidents_summary(incidents_data)
        
        # Ask if user wants detailed view of a specific incident
        if incidents_data.get('results'):
            detail_choice = input("\nView detailed information for a specific incident? (y/n): ").lower().strip()
            if detail_choice == 'y':
                try:
                    incident_id = int(input("Enter incident ID: "))
                    client.print_detailed_incident(incident_id)
                except ValueError:
                    print("Invalid incident ID entered")
        
        # Optionally save to file
        save_to_file = input("\nSave results to JSON file? (y/n): ").lower().strip()
        if save_to_file == 'y':
            filename = "freshstatus_incidents.json"
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(incidents_data, f, indent=2, ensure_ascii=False)
            print(f"Results saved to {filename}")
    
    else:
        print("Failed to retrieve incidents. Please check your API credentials and network connection.")

if __name__ == "__main__":
    main()
