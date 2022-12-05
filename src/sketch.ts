// -------------------
//  Population Class
// -------------------
class Population {
    constructor(popsize, mutationRate) {

        this.mutationRate = mutationRate;
        this.matingPool = [];
        this.generation = 1;

        this.population = [];
        for (let i = 0; i < popsize; i++) {
            this.population[i] = new Chromosome();
        }


    }

    run() {
        for (let i = 0; i < this.population.length; i++) {
            this.population[i].move();
            this.population[i].show();
        }
    }

    calcFitness() {
        for (let i = 0; i < this.population.length; i++) {
            this.population[i].calcFitness();
        }
    }

    naturalSelection() {
        this.matingPool = [];
        let maxFitness = this.getMaxFitness();
        for (let i = 0; i < this.population.length; i++) {
            let fitnessNormal = map(this.population[i].getFitness(), 0, maxFitness, 0, 1);
            let n = floor(fitnessNormal * 100);
            for (let j = 0; j < n; j++) {
                this.matingPool.push(this.population[i]);
            }
        }
    }

    generate() {
        let partnerA, partnerB, indexA, indexB;
        for (let i = 0; i < this.population.length; i++) {
            indexA = floor(random(this.matingPool.length));
            indexB = floor(random(this.matingPool.length));
            partnerA = this.matingPool[indexA].dna;
            partnerB = this.matingPool[indexB].dna;

            let child = partnerA.crossover(partnerB);
            child.mutate(this.mutationRate);
            this.population[i] = new Chromosome(child);
        }
        this.generation++;
    }

    // TOOLS

    getMaxFitness() {
        var record = 0;
        for (var i = 0; i < this.population.length; i++) {
            if (this.population[i].getFitness() > record) {
                record = this.population[i].getFitness();
            }
        }
        return record;
    }

    getGeneration() {
        return this.generation;
    }

    getAverage() {
        let total = 0;
        for (let i = 0; i < this.population.length; i++) {
            total += this.population[i].fitness;
        }
        return total / this.population.length;
    }
}
// -------------------
//  DNA Class
// -------------------
class DNA {
    constructor(genes) {

        this.maxForce = 0.5;

        this.genes = [];
        if (arguments.length < 1) {
            for (let i = 0; i < params.LifeTime; i++) {
                this.genes[i] = p5.Vector.random2D();
                this.genes[i].mult(random(this.maxForce));
            }
        } else {
            this.genes = genes;
        }
    }

    crossover(partner) {
        let childgenes = [];
        let midpoint = floor(random(this.genes.length));
        for (let i = 0; i < this.genes.length; i++) {
            if (i > midpoint) childgenes[i] = this.genes[i];
            else childgenes[i] = partner.genes[i];
        }
        let newchild = new DNA(childgenes);
        return newchild;
    }

    mutate(mutationRate) {
        for (let i = 0; i < this.genes.length; i++) {
            if (random(1) < mutationRate) {
                this.genes[i] = p5.Vector.random2D();
                this.genes[i].mult(random(this.maxForce));
            }
        }
    }
}

// -------------------
//  Chromosome Class
// -------------------
function euclid(x1, y1, x2, y2) {
    return sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2));
}

class Chromosome {
    constructor(dna) {
        this.position = createVector(width / 2, params.Diameter);
        this.velocity = createVector();
        this.acceleration = createVector();

        this.fitness = 0;
        if (arguments.length < 1) {
            this.dna = new DNA();
        } else {
            this.dna = dna;
        }
        this.geneCounter = 0;

        this.targetHit = false;

    }

    calcFitness() {
        let d = euclid(this.position.x, this.position.y, target.x, target.y);
        this.fitness = pow(1 / d, 2);
    }

    show() {
        fill(255, 0, 0);
        ellipse(this.position.x, this.position.y, params.Diameter, params.Diameter);
    }

    move() {
        if (!this.isHitTarget()) {
            this.applyForce(this.dna.genes[this.geneCounter]);
            this.geneCounter = (this.geneCounter + 1) % this.dna.genes.length;

            this.velocity.add(this.acceleration);
            this.position.add(this.velocity);
            this.acceleration.mult(0);
        }
    }

    applyForce(f) {
        this.acceleration.add(f);
    }

    isHitTarget() {
        let state = this.targetHit;
        let d = euclid(this.position.x, this.position.y, target.x, target.y);
        if (d < params.Diameter) this.targetHit = true;
        else this.targetHit = false;
        if (!state && this.targetHit) hitScore++;
        return this.targetHit;
    }

    getFitness() {
        return this.fitness;
    }
}

// -------------------
//  Parameters and UI
// -------------------

const gui = new dat.GUI()
const params = {
    Diameter: 30,
    LifeTime: 160,
    PopulationSize: 50,
    MutationRate: 0.01,
    Download_Image: () => save(),
}
gui.add(params, "Diameter", 0, 100, 1)
gui.add(params, "LifeTime", 0, 200, 1)
gui.add(params, "PopulationSize", 0, 100, 1).onChange(function (value) {

    population.population = [];
    for (let i = 0; i < value; i++) {
        population.population.push(new Chromosome());
    }
});
gui.add(params, "MutationRate", 0, 1, 0.01)
gui.add(params, "Download_Image")


let hitScore = 0;
let highScore = 0;

let lifeCounter = params.LifeTime;
let population;
let popsize = 50;
let mutationRate = params.MutationRate;

let target;

let generationP, lifeP, hitP;
// -------------------
//       Drawing
// -------------------

function draw() {
    background(220);

    fill(0, 0, 255);
    ellipse(target.x, target.y, params.Diameter, params.Diameter);

    if (lifeCounter > 0) {
        population.run();
        lifeCounter--;
        timerP.html("<b>Remaining time: " + lifeCounter + "</b>");
    }
    else {
        lifeCounter = params.LifeTime;
        if (hitScore > highScore) highScore = hitScore;
        highScoreP.html("<b>Highscore: " + highScore + " hit</b>");
        hitScore = 0;
        population.calcFitness();
        population.naturalSelection();
        population.generate();
        fill(0);
        generationP.html("<b>Generation: " + population.getGeneration() + "</b>");
    }
    hitP.html("<b>Target hit: " + hitScore + "/" + params.PopulationSize + "</b>");
}

function mousePressed() {
    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
        target.x = mouseX;
        target.y = mouseY;
        highScore = 0;
    }
}

// -------------------
//    Initialization
// -------------------

function setup() {
    p6_CreateCanvas()
    population = new Population(params.PopulationSize, params.MutationRate);
    target = createVector(width - params.Diameter / 2, height - params.Diameter / 2);
    timerP = createP("<b>Remaining: " + lifeCounter + "</b>");
    timerP.position(10, height + 75);
    generationP = createP("<b>Generation: 1</b>");
    generationP.position(10, height + 95);
    hitP = createP("<b>Target hit 0/" + params.PopulationSize + "</b>");
    hitP.position(10, height + 115);
    highScoreP = createP("<b>Highscore: " + highScore + " hit</b>")
    highScoreP.position(10, height + 135);
    // noStroke();
}

function windowResized() {
    p6_ResizeCanvas()

}
