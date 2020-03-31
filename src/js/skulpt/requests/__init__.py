# most restricted version
"""
This solution works in runestone - however it is much more limited.
An error does not occur in the same way in the textbook as it does
for the command line. Since HTTPError is not currently available in
Runestone, I had to change the exception.
Decode and Encode are not available in Runestone, so there might be
issues with reponses.
Does not use the status attribute for urlopen, would be nice to have
that back.
Does not work on regular web pages (like google or the michigan daily) because of cross-site scripting limits.
"""
from urllib.request import urlopen
import json

class Response:
    def __init__(self, data, url):
        self.text = data
        self.url = url

    def json(self):
        try:
            return json.loads(self.text)
        except:
            return {"error": "Response not interpretable as json. Try printing the .text attribute"}

    def __str__(self):
        return "<A Response object for the following request: {}>".format(self.url)


url_subs = {" ": "+",
            "!": "%21",
            '"': "%22",
            "#": "%23",
            "$": "%24",
            "'": "%27",
            "(": "%28",
            ")": "%29",
            "*": "%2A",
            "+": "%2B",
            ",": "%2C",
            "/": "%2F",
            ":": "%3A",
            ";": "%3B",
            "=": "%3D",
            "?": "%3F",
            "@": "%40",
            "[": "%5B",
            "]": "%5D",
            }

def _subst(s, substitutions=url_subs):
    res = ""
    for c in str(s):
        if c in substitutions:
            res += substitutions[c]
        else:
            res += c
    return res


def requestURL(baseurl, params={}):
    try:
        if len(params) == 0:
            return baseurl
        complete_url = baseurl + "?"
        pairs = ["{}={}".format(_subst(k), _subst(params[k])) for k in params]
        complete_url += "&".join(pairs)
        return complete_url
    except:
        return None

def get(baseurl, params={}):
    full_url = requestURL(baseurl, params)
    if not full_url:
        text_data = "<html><body><h1>invalid request</h1></body></html>"
        full_url = "Couldn’t generate a valid URL"
    else:
        data = urlopen(full_url)
        text_data = data.read().strip()
        if len(text_data) == 0:
            text_data = "Failed to retrieve that URL"
    return Response(text_data, full_url)