import { ProductionProject } from './types';

export const mockProjects: ProductionProject[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Diamond Ring',
    title: 'Diamond Ring',
    startDate: '2024-06-01',
    endDate: '2024-06-20',
    start: new Date('2024-06-01'),
    end: new Date('2024-06-20'),
    progress: 60,
    priority: 'high',
    status: 'on-track',
    dependencies: [],
    assignedTeam: ['Alice', 'Bob', 'Charlie'],
    stages: [
      {
        id: '1',
        name: 'Design',
        order: 1,
        estimatedDuration: 3,
        start: '2024-06-01',
        end: '2024-06-03',
        status: 'completed',
        partner: 'Alice',
        assignedTo: ['Alice'],
        dependencies: [],
        progress: 100
      },
      {
        id: '2',
        name: 'CAD',
        order: 2,
        estimatedDuration: 3,
        start: '2024-06-04',
        end: '2024-06-06',
        status: 'in-progress',
        partner: 'Bob',
        assignedTo: ['Bob'],
        dependencies: ['1'],
        progress: 60
      },
      {
        id: '3',
        name: 'Casting',
        order: 3,
        estimatedDuration: 4,
        start: '2024-06-07',
        end: '2024-06-10',
        status: 'pending',
        partner: 'Charlie',
        assignedTo: ['Charlie'],
        dependencies: ['2'],
        progress: 0
      }
    ]
  },
  {
    id: '223e4567-e89b-12d3-a456-426614174000',
    name: 'Gold Necklace',
    title: 'Gold Necklace',
    startDate: '2024-06-05',
    endDate: '2024-06-25',
    start: new Date('2024-06-05'),
    end: new Date('2024-06-25'),
    progress: 40,
    priority: 'medium',
    status: 'at-risk',
    dependencies: [],
    assignedTeam: ['Alice', 'Bob', 'Charlie'],
    stages: [
      {
        id: '4',
        name: 'Design',
        order: 1,
        estimatedDuration: 3,
        start: '2024-06-05',
        end: '2024-06-07',
        status: 'completed',
        partner: 'Alice',
        assignedTo: ['Alice'],
        dependencies: [],
        progress: 100
      },
      {
        id: '5',
        name: 'CAD',
        order: 2,
        estimatedDuration: 3,
        start: '2024-06-08',
        end: '2024-06-10',
        status: 'delayed',
        partner: 'Bob',
        assignedTo: ['Bob'],
        dependencies: ['4'],
        progress: 30
      },
      {
        id: '6',
        name: 'Casting',
        order: 3,
        estimatedDuration: 5,
        start: '2024-06-11',
        end: '2024-06-15',
        status: 'pending',
        partner: 'Charlie',
        assignedTo: ['Charlie'],
        dependencies: ['5'],
        progress: 0
      }
    ]
  },
  {
    id: '323e4567-e89b-12d3-a456-426614174000',
    name: 'Custom Wedding Set',
    title: 'Custom Wedding Set',
    startDate: '2024-06-17',
    endDate: '2024-06-28',
    start: new Date('2024-06-17'),
    end: new Date('2024-06-28'),
    progress: 30,
    priority: 'high',
    status: 'on-track',
    dependencies: [],
    assignedTeam: ['Alice', 'David', 'Charlie'],
    stages: [
      {
        id: '7',
        name: 'Design',
        order: 1,
        estimatedDuration: 3,
        start: '2024-06-17',
        end: '2024-06-19',
        status: 'completed',
        partner: 'Alice',
        assignedTo: ['Alice'],
        dependencies: [],
        progress: 100
      },
      {
        id: '8',
        name: 'CAD',
        order: 2,
        estimatedDuration: 3,
        start: '2024-06-20',
        end: '2024-06-22',
        status: 'in-progress',
        partner: 'David',
        assignedTo: ['David'],
        dependencies: ['7'],
        progress: 40
      },
      {
        id: '9',
        name: 'Casting',
        order: 3,
        estimatedDuration: 3,
        start: '2024-06-23',
        end: '2024-06-25',
        status: 'pending',
        partner: 'Charlie',
        assignedTo: ['Charlie'],
        dependencies: ['8'],
        progress: 0
      }
    ]
  }
]; 