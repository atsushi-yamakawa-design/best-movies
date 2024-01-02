import axios from "axios";
import { useEffect, useState } from "react";
import style from "./page.module.scss";
// import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

interface Movie {
  id: number;
  title: string;
  poster_path?: string;
}

export default function MoviePage() {
  const [search, setSearch] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovies, setSelectedMovies] = useState<Movie[]>([]);
  const [showSearchModule, setShowSearchModule] = useState(true);

  useEffect(() => {
    if (search) {
      axios
        .get(
          `https://api.themoviedb.org/3/search/movie?api_key=${
            process.env.NEXT_PUBLIC_TMDB_API_KEY
          }&query=${encodeURIComponent(search)}`
        )
        .then((response) => {
          setMovies(response.data.results);
        })
        .catch((error) => console.error(error));
    }
  }, [search]);

  const handleMovieSelect = (movie: Movie) => {
    if (selectedMovies.find((m) => m.id === movie.id)) {
      setSelectedMovies(selectedMovies.filter((m) => m.id !== movie.id));
    } else if (selectedMovies.length < 10) {
      setSelectedMovies([...selectedMovies, movie]);
    }
  };

  const handleButtonClick = () => {
    setShowSearchModule(false);
  };

  return (
    <>
      <main className={style.searchPage}>
        <h1>⭐️今年の映画ベスト10⭐️</h1>
        {showSearchModule ? (
          <>
            <ul className={style.selectedMovies}>
              {selectedMovies.map((movie) => (
                <li key={movie.id}>{movie.title}</li>
              ))}
            </ul>
            {selectedMovies.length > 0 && (
              <button
                disabled={selectedMovies.length < 10}
                onClick={handleButtonClick}
                className={style.movieCountButton}>
                {selectedMovies.length}件選択中
              </button>
            )}
            <div className={style.searchModule}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="タイトルを入力"
                className={style.textInput}
              />
              <ul className={style.movieList}>
                {movies.map((movie) => (
                  <li key={movie.id} onClick={() => handleMovieSelect(movie)}>
                    <p className={style.movieTitle}>{movie.title}</p>
                    {selectedMovies.find((m) => m.id === movie.id) && (
                      <p>選択中</p>
                    )}
                    {movie.poster_path && (
                      <img
                        src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
                        alt={movie.title}
                      />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <div className={style.resultMovies}>
            <ul className={style.resultMoviesTitleList}>
              {selectedMovies.map((movie) => (
                <li key={movie.id}>{movie.title}</li>
              ))}
            </ul>

            <div className={style.resultMoviesImgList}>
              {selectedMovies.map(
                (movie) =>
                  movie.poster_path && (
                    <img
                      key={movie.id}
                      src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
                      alt={movie.title}
                    />
                  )
              )}
            </div>
          </div>
        )}
        <div className={style.credit}>
          movie database by
          <img src="/icon/tmdb_logo.svg" alt="TMDB" />
        </div>
      </main>
    </>
  );
}
