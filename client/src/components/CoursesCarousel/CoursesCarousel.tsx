import { Course } from "../../types";
import "./coursesCarrousel.scss";

interface CoursesCarouselProps { //gambiarra do copilot pro ts não encher o saco
    title: string;
    courses: Course[];
    renderActions?: (course: Course) => React.ReactNode;
}

function CoursesCarousel({title, courses, renderActions}: CoursesCarouselProps){
    return(
        <section className="courses-carousel">
            <h1>{title}</h1>
            <div className="courses">
                {courses.map(course => (
                    <div key={course.id}>
                        <h1>{course.title}</h1>
                        <img src={`http://localhost:3000/getFile/${course.thubnail}`} alt={course.title} />
                        <p>{course.description}</p>
                        {renderActions && renderActions(course)}
                    </div>
                ))}
            </div>
        </section>
    )
}

export default CoursesCarousel;