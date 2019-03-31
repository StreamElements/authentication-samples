package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi"

	"golang.org/x/oauth2"
)

const apiBASE = "https://api.streamelements.com"

// Channel is a StreamElements channel
type Channel struct {
	ID   string `json:"_id"`
	Name string `json:"username"`
}

var oauth = oauth2.Config{
	ClientID:     os.Getenv("CLIENT_ID"),
	ClientSecret: os.Getenv("CLIENT_SECRET"),
	RedirectURL:  os.Getenv("REDIRECT_URI"),
	Scopes:       []string{},
	Endpoint: oauth2.Endpoint{
		AuthURL:  apiBASE + "/oauth2/authorize",
		TokenURL: apiBASE + "/oauth2/token",
	},
}

var httpClient = http.Client{}

func main() {
	r := chi.NewRouter()
	r.Get("/", handleRedirect)
	r.Get("/callback", handleCallback)
	log.Fatal(http.ListenAndServe(":3200", r))
}

func handleRedirect(w http.ResponseWriter, r *http.Request) {
	uri := oauth.AuthCodeURL("")
	http.Redirect(w, r, uri, http.StatusTemporaryRedirect)
}

func handleCallback(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")
	if code == "" {
		w.Write([]byte("No code"))
		w.WriteHeader(400)
		return
	}

	token, err := oauth.Exchange(context.Background(), code)
	if err != nil {
		w.Write([]byte("Failed to exchange token"))
		w.WriteHeader(400)
		return
	}

	channel, err := getChannel(token.AccessToken)
	if err != nil {
		w.Write([]byte("Failed to get channel"))
		w.WriteHeader(400)
		return
	}
	bs, err := json.Marshal(channel)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(200)
	w.Write(bs)
}

func getChannel(authToken string) (*Channel, error) {
	url := fmt.Sprintf("%s/kappa/v2/channels/me", apiBASE)
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Add("Authorization", fmt.Sprintf("OAuth %s", authToken))
	res, err := httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	bs, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}
	channel := &Channel{}
	err = json.Unmarshal(bs, channel)
	if err != nil {
		return nil, err
	}
	return channel, nil
}
