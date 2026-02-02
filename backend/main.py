from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import asyncio
import random
import string
import os
from dotenv import load_dotenv
load_dotenv()
app = FastAPI(title="Username Availability Checker")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define social media platforms to check
PLATFORMS = {
    "twitter": "https://twitter.com/{username}",
    "instagram": "https://www.instagram.com/{username}/",
    "github": "https://github.com/{username}",
    "tiktok": "https://www.tiktok.com/@{username}",
    "youtube": "https://www.youtube.com/@{username}",
    "reddit": "https://www.reddit.com/user/{username}",
    "pinterest": "https://www.pinterest.com/{username}/",
    "linkedin": "https://www.linkedin.com/in/{username}",
    "twitch": "https://www.twitch.tv/{username}",
    "snapchat": "https://www.snapchat.com/add/{username}",
}


class UsernameRequest(BaseModel):
    username: str


class PlatformStatus(BaseModel):
    platform: str
    url: str
    available: bool
    error: str | None = None


class UsernameResponse(BaseModel):
    username: str
    results: list[PlatformStatus]
    all_available: bool
    suggestions: list[str]


async def check_username_on_platform(
    client: httpx.AsyncClient, platform: str, username: str
) -> PlatformStatus:
    """Check if a username is available on a specific platform."""
    url = PLATFORMS[platform].format(username=username)
    
    try:
        # Use HEAD request first (faster), fall back to GET if needed
        response = await client.head(url, follow_redirects=True, timeout=10.0)
        
        # Most platforms return 404 if username doesn't exist
        if response.status_code == 404:
            available = True
        elif response.status_code == 200:
            available = False
        else:
            # For other status codes, try GET request
            response = await client.get(url, follow_redirects=True, timeout=10.0)
            available = response.status_code == 404
        
        return PlatformStatus(
            platform=platform,
            url=url,
            available=available
        )
    except httpx.TimeoutException:
        return PlatformStatus(
            platform=platform,
            url=url,
            available=False,
            error="Request timed out"
        )
    except Exception as e:
        return PlatformStatus(
            platform=platform,
            url=url,
            available=False,
            error=str(e)
        )


def generate_username_suggestions(base_username: str, count: int = 10) -> list[str]:
    """Generate similar username suggestions."""
    suggestions = []
    
    # Add numbers at the end
    for i in range(1, 4):
        suggestions.append(f"{base_username}{i}")
    suggestions.append(f"{base_username}{random.randint(10, 99)}")
    suggestions.append(f"{base_username}{random.randint(100, 999)}")
    
    # Add underscores
    suggestions.append(f"{base_username}_")
    suggestions.append(f"_{base_username}")
    suggestions.append(f"the{base_username}")
    suggestions.append(f"{base_username}official")
    suggestions.append(f"real{base_username}")
    
    # Add year
    suggestions.append(f"{base_username}2025")
    suggestions.append(f"{base_username}2026")
    
    # Randomize with suffix
    random_suffix = ''.join(random.choices(string.ascii_lowercase, k=2))
    suggestions.append(f"{base_username}{random_suffix}")
    
    # Double last letter if ends with a letter
    if base_username and base_username[-1].isalpha():
        suggestions.append(f"{base_username}{base_username[-1]}")
    
    # Remove duplicates and limit
    unique_suggestions = list(dict.fromkeys(suggestions))
    return unique_suggestions[:count]


@app.get("/")
def read_root():
    return {
        "message": "Username Availability Checker API",
        "endpoints": {
            "POST /check": "Check username availability across platforms",
            "POST /check-domain": "Check if a domain exists using WHOIS lookup",
            "GET /platforms": "List all supported platforms"
        }
    }


@app.get("/platforms")
def get_platforms():
    """Get list of all supported platforms."""
    return {"platforms": list(PLATFORMS.keys())}


# WhoisXML API configuration
WHOIS_API_URL = os.getenv("WHOIS_API_URL")
WHOIS_API_KEY = os.getenv("WHOIS_API_KEY")


class DomainRequest(BaseModel):
    domain_name: str


class DomainResponse(BaseModel):
    domain_name: str
    domain_exists: bool
    registrar: str | None = None
    creation_date: str | None = None
    expiration_date: str | None = None
    name_servers: list[str] = []
    raw_data: dict | None = None
    error: str | None = None


@app.post("/check-domain", response_model=DomainResponse)
async def check_domain(request: DomainRequest):
    """
    Check if a domain exists using the WhoisXML API.
    Returns WHOIS information including registrar, dates, and name servers.
    """
    domain_name = request.domain_name.strip().lower()
    
    # Remove protocol if present
    if domain_name.startswith("http://"):
        domain_name = domain_name[7:]
    elif domain_name.startswith("https://"):
        domain_name = domain_name[8:]
    
    # Remove www. if present
    if domain_name.startswith("www."):
        domain_name = domain_name[4:]
    
    # Remove trailing slashes and paths
    domain_name = domain_name.split("/")[0]
    
    if not domain_name:
        return DomainResponse(
            domain_name=domain_name,
            domain_exists=False,
            error="Invalid domain name"
        )
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                WHOIS_API_URL,
                json={
                    "domainName": domain_name,
                    "apiKey": WHOIS_API_KEY,
                    "outputFormat": "JSON"
                },
                headers={"Content-Type": "application/json"},
                timeout=30.0
            )
            
            data = response.json()
            
            # Check if domain exists based on WHOIS response
            whois_record = data.get("WhoisRecord", {})
            registry_data = whois_record.get("registryData", {})
            
            # Domain exists if we have registry data or registrar info
            domain_exists = bool(
                registry_data or 
                whois_record.get("registrarName") or
                whois_record.get("createdDate")
            )
            
            # Extract name servers
            name_servers = []
            ns_data = registry_data.get("nameServers", {})
            if isinstance(ns_data, dict):
                host_names = ns_data.get("hostNames", [])
                if isinstance(host_names, list):
                    name_servers = host_names
            
            return DomainResponse(
                domain_name=domain_name,
                domain_exists=domain_exists,
                registrar=whois_record.get("registrarName"),
                creation_date=whois_record.get("createdDate") or registry_data.get("createdDate"),
                expiration_date=whois_record.get("expiresDate") or registry_data.get("expiresDate"),
                name_servers=name_servers,
                raw_data=whois_record
            )
            
    except httpx.TimeoutException:
        return DomainResponse(
            domain_name=domain_name,
            domain_exists=False,
            error="Request timed out"
        )
    except Exception as e:
        return DomainResponse(
            domain_name=domain_name,
            domain_exists=False,
            error=str(e)
        )


@app.post("/check", response_model=UsernameResponse)
async def check_username(request: UsernameRequest):
    """
    Check if a username is available across all social media platforms.
    Returns availability status for each platform and suggestions if taken.
    """
    username = request.username.strip()
    
    # Validate username
    if not username:
        return UsernameResponse(
            username=username,
            results=[],
            all_available=False,
            suggestions=[]
        )
    
    # Remove @ if present
    if username.startswith("@"):
        username = username[1:]
    
    # Check all platforms concurrently
    async with httpx.AsyncClient(
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
    ) as client:
        tasks = [
            check_username_on_platform(client, platform, username)
            for platform in PLATFORMS
        ]
        results = await asyncio.gather(*tasks)
    print("results", results)
    # Check if all are available
    all_available = all(r.available for r in results if r.error is None)
    print("all_available", all_available)
    # Generate suggestions if not all available
    suggestions = []
    if not all_available:
        suggestions = generate_username_suggestions(username)
    print("suggestions", suggestions)
    return UsernameResponse(
        username=username,
        results=results,
        all_available=all_available,
        suggestions=suggestions
    )