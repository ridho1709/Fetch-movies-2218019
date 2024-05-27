import { baseUrl, apiToken, imageUrl } from "./config.js";

const nowPlayingEndpoint = `${baseUrl}/movie/now_playing`;
const searchMovieEndpoint = (query) => `${baseUrl}/search/movie?query=${query}`;
const movieDetailEndpoint = (movieId) => `${baseUrl}/movie/${movieId}`;
const fetchOptions = {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiToken}`,
  },
};
const contentElm = document.querySelector("#content");

const app = () => {
  const displayLoading = (state) => {
    if (state) {
      contentElm.innerHTML = `
      <div class="text-center">
        <div class="spinner-border text-center" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
      </div>
        `;
    }
  };

  const displayMovies = (movies) => {
    let moviesTemplate = `
        <div class="row row-cols-1 row-cols-md-3 g-2 g-4">
        `;
    if (movies.length < 1) {
      displayAlert("Data tidak ditemukan");
      return false;
    }
    movies.forEach((movie) => {
      const { id, original_title, overview, poster_path } = movie;
      moviesTemplate += `
            <div class="col-lg-4 col-md-6 col-sm-12">
            <div class="card h-100">
              <img src="${imageUrl}${poster_path}" class="card-img-top" alt="..." />
              <div class="card-body">
                <h5 class="card-title">${original_title}</h5>
                <p class="card-text truncate">
                  ${overview}
                </p>
                <a href="#" data-id="${id}" class="card-link">Detil</a>
              </div>
            </div>
          </div>
            `;
    });
    moviesTemplate += `</div>`;
    contentElm.innerHTML = moviesTemplate;
  };

  const getNowPlayingList = () => {
    displayLoading(true);
    fetch(nowPlayingEndpoint, fetchOptions)
      .then((response) => response.json())
      .then((responseJson) => displayMovies(responseJson.results))
      .catch((error) => console.error(error));
  };

  const displayAlert = (message) => {
    contentElm.innerHTML = `<div class="alert alert-warning" role="alert">
    ${message}
  </div>`;
  };

  const searchBtn = document.querySelector("#btnSearch");
  const searchText = document.querySelector("#searchInput");

  searchText.addEventListener("input", function (event) {
    if (this.value.length < 1) getNowPlayingList();
  });

  searchText.addEventListener("keydown", function (event) {
    if (
      this.value.length > 0 &&
      (event.key === "Enter" || event.keyCode === 13)
    ) {
      event.preventDefault();
      searchMovies();
    }
  });

  searchBtn.addEventListener("click", function (event) {
    event.preventDefault();
    if (searchText.value.length > 1) searchMovies();
  });

  const searchMovies = async () => {
    displayLoading(true);
    try {
      const movieList = await fetch(
        searchMovieEndpoint(searchText.value),
        fetchOptions
      );
      const responseJson = await movieList.json();
      displayMovies(responseJson.results);
      console.log(responseJson.results);
    } catch (error) {
      console.log(error);
      displayAlert("Terjadi error saat mengambil data");
    }
  };

  const displayMovieDetail = (movie) => {
    const {
      original_title,
      overview,
      poster_path,
      release_date,
      vote_average,
    } = movie;
    const modalBody = document.querySelector(".modal-body");
    const modalTitle = document.querySelector(".modal-title");

    modalTitle.innerText = original_title;
    modalBody.innerHTML = `
      <img src="${imageUrl}${poster_path}" class="img-fluid mb-3" alt="${original_title}" />
      <p><strong>Release Date:</strong> ${release_date}</p>
      <p><strong>Rating:</strong> ${vote_average}</p>
      <p>${overview}</p>
    `;

    $("#myModal").modal("show");
  };

  const fetchMovieDetail = async (movieId) => {
    try {
      const response = await fetch(movieDetailEndpoint(movieId), fetchOptions);
      const movie = await response.json();
      displayMovieDetail(movie);
    } catch (error) {
      console.error(error);
      displayAlert("Gagal mengambil detail film");
    }
  };

  contentElm.addEventListener("click", function (event) {
    if (event.target.classList.contains("card-link")) {
      event.preventDefault();
      const movieId = event.target.dataset.id;
      fetchMovieDetail(movieId);
    }
  });

  window.addEventListener("DOMContentLoaded", getNowPlayingList);
};

export default app;
